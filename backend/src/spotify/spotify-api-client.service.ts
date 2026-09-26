import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { RankedArtist, Track } from '@soundtrack-timeline/shared';
import { AuthService } from '../auth/auth.service';
import { SessionStoreService } from '../auth/session-store.service';
import { normalizeSpotifyArtists, normalizeSpotifyTracks } from './spotify-normalizer.util';
import {
  SpotifyPaginatedResponse,
  SpotifyRawArtist,
  SpotifyRawTrack,
  SpotifyTimeRange,
  TopMusicSummaryResponse,
} from './spotify.types';

@Injectable()
export class SpotifyApiClientService {
  private readonly logger = new Logger(SpotifyApiClientService.name);
  private readonly spotifyApiBaseUrl = 'https://api.spotify.com/v1';

  constructor(
    private readonly sessionStore: SessionStoreService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Obtiene las pistas más escuchadas del usuario en el rango temporal especificado.
   */
  async getTopTracks(
    sessionId: string,
    timeRange: SpotifyTimeRange = 'medium_term',
    limit = 50,
  ): Promise<Track[]> {
    const response = await this.makeSpotifyRequest<SpotifyPaginatedResponse<SpotifyRawTrack>>(
      sessionId,
      `${this.spotifyApiBaseUrl}/me/top/tracks`,
      {
        time_range: timeRange,
        limit,
      },
    );

    return normalizeSpotifyTracks(response.items);
  }

  /**
   * Obtiene los artistas más escuchados del usuario en el rango temporal especificado.
   */
  async getTopArtists(
    sessionId: string,
    timeRange: SpotifyTimeRange = 'medium_term',
    limit = 50,
    referenceTracks: readonly Track[] = [],
  ): Promise<RankedArtist[]> {
    const response = await this.makeSpotifyRequest<SpotifyPaginatedResponse<SpotifyRawArtist>>(
      sessionId,
      `${this.spotifyApiBaseUrl}/me/top/artists`,
      {
        time_range: timeRange,
        limit,
      },
    );

    return normalizeSpotifyArtists(response.items, referenceTracks);
  }

  /**
   * Obtiene una síntesis musical optimizada de pistas y artistas normalizados en una sola operación.
   */
  async getTopMusicSummary(
    sessionId: string,
    timeRange: SpotifyTimeRange = 'medium_term',
  ): Promise<TopMusicSummaryResponse> {
    const [tracksResponse, artistsResponse] = await Promise.all([
      this.makeSpotifyRequest<SpotifyPaginatedResponse<SpotifyRawTrack>>(
        sessionId,
        `${this.spotifyApiBaseUrl}/me/top/tracks`,
        { time_range: timeRange, limit: 50 },
      ),
      this.makeSpotifyRequest<SpotifyPaginatedResponse<SpotifyRawArtist>>(
        sessionId,
        `${this.spotifyApiBaseUrl}/me/top/artists`,
        { time_range: timeRange, limit: 50 },
      ),
    ]);

    const tracks = normalizeSpotifyTracks(tracksResponse.items);
    const artists = normalizeSpotifyArtists(artistsResponse.items, tracks);

    return {
      timeRange,
      totalTracks: tracks.length,
      totalArtists: artists.length,
      tracks,
      artists,
    };
  }

  /**
   * Realiza una petición autenticada a la API de Spotify con manejo de Rate Limiting (429)
   * y reintento automático con refresco de token ante expiración (401).
   */
  private async makeSpotifyRequest<T>(
    sessionId: string,
    url: string,
    params: Record<string, string | number>,
    isRetry = false,
  ): Promise<T> {
    const session = await this.sessionStore.getSession(sessionId);

    if (!session || !session.accessToken) {
      throw new UnauthorizedException('Sesión no encontrada o no autenticada con Spotify');
    }

    try {
      const response = await axios.get<T>(url, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        params,
      });

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;

        // Caso 1: Token expirado (401) -> Intentar refresco automático una única vez
        if (status === 401 && !isRetry) {
          this.logger.warn(
            `Access token expirado para la sesión ${sessionId}. Ejecutando refresco automático...`,
          );

          try {
            await this.authService.refreshSession(sessionId);
            return await this.makeSpotifyRequest<T>(sessionId, url, params, true);
          } catch (refreshErr) {
            this.logger.error(
              'Error al intentar refrescar la sesión expirada de Spotify',
              refreshErr,
            );
            throw new UnauthorizedException(
              'La sesión de Spotify ha expirado. Por favor inicie sesión nuevamente.',
            );
          }
        }

        // Caso 2: Rate limit excedido (429)
        if (status === 429) {
          const retryAfterHeader = axiosError.response?.headers?.['retry-after'];
          const retryAfter = retryAfterHeader ? parseInt(String(retryAfterHeader), 10) : 5;

          this.logger.warn(`Límite de tasa de Spotify excedido (429). Retry-After: ${retryAfter}s`);

          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: 'Límite de peticiones de Spotify excedido. Por favor intente más tarde.',
              retryAfterSeconds: retryAfter,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        // Caso 3: Otros errores de Spotify
        const errorData = axiosError.response?.data;
        this.logger.error(
          `Error en llamada a Spotify API [${url}] - Status: ${status}`,
          errorData ?? axiosError.message,
        );

        throw new HttpException(
          {
            statusCode: status ?? HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error al comunicarse con la API de Spotify',
            details: errorData,
          },
          status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      this.logger.error(`Error no esperado al consultar Spotify API: ${String(error)}`);
      throw new InternalServerErrorException('Error interno al consultar la API de Spotify');
    }
  }
}
