import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import axios from 'axios';
import { AuthStatus } from '@soundtrack-timeline/shared';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateRandomString,
  generateState,
} from './pkce.util';
import { SessionStoreService, UserSessionData } from './session-store.service';

export const SPOTIFY_OAUTH_SCOPES = [
  'user-top-read',
  'user-read-recently-played',
  'user-read-private',
  'user-read-email',
] as const;

export interface AuthorizationUrlResult {
  readonly url: string;
  readonly state: string;
}

export interface CallbackResult {
  readonly sessionId: string;
  readonly userId: string;
  readonly displayName: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(SessionStoreService)
    private readonly sessionStore: SessionStoreService,
  ) {}

  private get clientId(): string {
    return process.env.SPOTIFY_CLIENT_ID ?? 'placeholder_client_id';
  }

  private get redirectUri(): string {
    return process.env.SPOTIFY_REDIRECT_URI ?? 'http://localhost:4000/api/auth/callback';
  }

  /**
   * Genera el enlace de autorización con PKCE (RFC 7636).
   */
  async generateAuthorizationUrl(): Promise<AuthorizationUrlResult> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Guardar code_verifier efímero vinculado al state (TTL de 10 minutos)
    await this.sessionStore.saveOAuthState(state, codeVerifier, 600);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: SPOTIFY_OAUTH_SCOPES.join(' '),
      redirect_uri: this.redirectUri,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
    return { url, state };
  }

  /**
   * Procesa el código de autorización devuelto por Spotify e intercambia por tokens con PKCE.
   */
  async handleCallback(code?: string, state?: string): Promise<CallbackResult> {
    if (!code || !state) {
      throw new BadRequestException('Parámetros code y state requeridos en el callback');
    }

    const codeVerifier = await this.sessionStore.getAndConsumeOAuthVerifier(state);
    if (!codeVerifier) {
      throw new UnauthorizedException('Parámetro state inválido o flujo expirado');
    }

    try {
      // 1. Intercambio de tokens vía POST con code_verifier
      const tokenResponse = await axios.post<{
        access_token: string;
        token_type: string;
        scope: string;
        expires_in: number;
        refresh_token?: string;
      }>(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          code_verifier: codeVerifier,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // 2. Consulta básica de perfil de Spotify (solo id y nombre para la sesión)
      const userResponse = await axios.get<{ id: string; display_name?: string }>(
        'https://api.spotify.com/v1/me',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const userId = userResponse.data.id;
      const displayName = userResponse.data.display_name ?? userId;
      const sessionId = generateRandomString(32);

      const sessionData: UserSessionData = {
        sessionId,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + expires_in * 1000,
        userId,
        displayName,
      };

      // Guardar sesión en memoria / Redis con TTL de duración del token
      await this.sessionStore.saveSession(sessionId, sessionData, expires_in);

      return { sessionId, userId, displayName };
    } catch (error) {
      this.logger.error('Error al intercambiar código de Spotify con PKCE', error);
      throw new UnauthorizedException('Fallo en la autenticación con Spotify');
    }
  }

  /**
   * Consulta el estado de autenticación actual.
   */
  async getAuthStatus(sessionId?: string): Promise<AuthStatus> {
    if (!sessionId) {
      return {
        isAuthenticated: false,
        isDemo: true,
      };
    }

    const session = await this.sessionStore.getSession(sessionId);
    if (!session) {
      return {
        isAuthenticated: false,
        isDemo: true,
      };
    }

    return {
      isAuthenticated: true,
      isDemo: false,
      userId: session.userId,
      displayName: session.displayName,
    };
  }

  /**
   * Refresca los tokens de la sesión antes de su expiración.
   */
  async refreshSession(sessionId: string): Promise<void> {
    const session = await this.sessionStore.getSession(sessionId);
    if (!session || !session.refreshToken) {
      throw new UnauthorizedException('Sesión no encontrada o sin refresh token');
    }

    try {
      const response = await axios.post<{
        access_token: string;
        expires_in: number;
        refresh_token?: string;
      }>(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: session.refreshToken,
          client_id: this.clientId,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const updatedSession: UserSessionData = {
        ...session,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token ?? session.refreshToken,
        expiresAt: Date.now() + response.data.expires_in * 1000,
      };

      await this.sessionStore.saveSession(sessionId, updatedSession, response.data.expires_in);
    } catch (error) {
      this.logger.error('Error al refrescar token de Spotify', error);
      await this.sessionStore.destroySession(sessionId);
      throw new UnauthorizedException('Token de actualización expirado');
    }
  }

  /**
   * Cierra sesión destruyendo el estado efímero.
   */
  async logout(sessionId?: string): Promise<void> {
    if (sessionId) {
      await this.sessionStore.destroySession(sessionId);
    }
  }
}
