import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionStoreService, UserSessionData } from './session-store.service';

vi.mock('axios');

describe('AuthService', () => {
  let authService: AuthService;
  let sessionStore: SessionStoreService;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStore = new SessionStoreService();
    sessionStore.onModuleInit();
    authService = new AuthService(sessionStore);
  });

  it('genera una URL de autorización de Spotify con PKCE y state persistido', async () => {
    const result = await authService.generateAuthorizationUrl();

    expect(result.url).toContain('https://accounts.spotify.com/authorize');
    expect(result.url).toContain('code_challenge=');
    expect(result.url).toContain('code_challenge_method=S256');
    expect(result.url).toContain(`state=${result.state}`);
    expect(result.url).toContain('user-top-read');

    // Comprobamos que el state fue registrado en el store
    const verifier = await sessionStore.getAndConsumeOAuthVerifier(result.state);
    expect(verifier).not.toBeNull();
  });

  it('rechaza callback si faltan parámetros code o state', async () => {
    await expect(authService.handleCallback(undefined, 'some_state')).rejects.toThrow(
      BadRequestException,
    );
    await expect(authService.handleCallback('some_code', undefined)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('rechaza callback si el state no existe o expiró', async () => {
    await expect(authService.handleCallback('some_code', 'invalid_state')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('intercambia el código por tokens y crea sesión de usuario exitosamente', async () => {
    const { state } = await authService.generateAuthorizationUrl();

    vi.mocked(axios.post).mockResolvedValueOnce({
      data: {
        access_token: 'mock_access_token',
        token_type: 'Bearer',
        scope: 'user-top-read',
        expires_in: 3600,
        refresh_token: 'mock_refresh_token',
      },
    });

    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        id: 'usr_spotify_99',
        display_name: 'Fito Páez',
      },
    });

    const callbackResult = await authService.handleCallback('valid_code', state);

    expect(callbackResult.userId).toBe('usr_spotify_99');
    expect(callbackResult.displayName).toBe('Fito Páez');
    expect(callbackResult.sessionId).toBeDefined();

    // Verificamos que la sesión está activa
    const status = await authService.getAuthStatus(callbackResult.sessionId);
    expect(status.isAuthenticated).toBe(true);
    expect(status.isDemo).toBe(false);
    expect(status.userId).toBe('usr_spotify_99');
  });

  it('retorna estado Demo si la sesión no existe o es nula', async () => {
    const statusNull = await authService.getAuthStatus(undefined);
    expect(statusNull.isAuthenticated).toBe(false);
    expect(statusNull.isDemo).toBe(true);

    const statusUnknown = await authService.getAuthStatus('unknown_session');
    expect(statusUnknown.isAuthenticated).toBe(false);
    expect(statusUnknown.isDemo).toBe(true);
  });

  it('permite cerrar sesión destruyendo el estado efímero', async () => {
    const sessionData: UserSessionData = {
      sessionId: 'sess_logout',
      accessToken: 'token',
      expiresAt: Date.now() + 3600 * 1000,
      userId: 'usr_logout',
      displayName: 'User',
    };
    await sessionStore.saveSession(sessionData.sessionId, sessionData, 3600);

    let status = await authService.getAuthStatus(sessionData.sessionId);
    expect(status.isAuthenticated).toBe(true);

    await authService.logout(sessionData.sessionId);

    status = await authService.getAuthStatus(sessionData.sessionId);
    expect(status.isAuthenticated).toBe(false);
    expect(status.isDemo).toBe(true);
  });
});
