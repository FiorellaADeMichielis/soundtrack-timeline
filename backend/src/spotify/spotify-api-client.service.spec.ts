import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { SpotifyApiClientService } from './spotify-api-client.service';
import { AuthService } from '../auth/auth.service';
import { SessionStoreService } from '../auth/session-store.service';
import { SpotifyPaginatedResponse, SpotifyRawArtist, SpotifyRawTrack } from './spotify.types';

vi.mock('axios');

describe('SpotifyApiClientService', () => {
  let service: SpotifyApiClientService;
  let mockSessionStore: Partial<SessionStoreService>;
  let mockAuthService: Partial<AuthService>;

  const mockSession: import('../auth/session-store.service').UserSessionData = {
    sessionId: 'session_123',
    userId: 'usr_1',
    displayName: 'Gustavo Cerati',
    accessToken: 'valid_access_token_123',
    refreshToken: 'valid_refresh_token_456',
    expiresAt: Date.now() + 3600000,
  };

  const mockRawTrack: SpotifyRawTrack = {
    id: 'trk_1',
    name: 'Crimen',
    artists: [{ id: 'art_cerati', name: 'Gustavo Cerati' }],
    album: {
      id: 'alb_ahi_vamos',
      name: 'Ahí Vamos',
      release_date: '2006-04-04',
      images: [{ url: 'https://i.scdn.co/image/ahivamos.jpg', height: 640, width: 640 }],
    },
    duration_ms: 228000,
    popularity: 85,
    preview_url: null,
  };

  const mockRawArtist: SpotifyRawArtist = {
    id: 'art_cerati',
    name: 'Gustavo Cerati',
    genres: ['argentine rock', 'rock en espanol'],
    images: [{ url: 'https://i.scdn.co/image/cerati.jpg', height: 640, width: 640 }],
    popularity: 80,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSessionStore = {
      getSession: vi.fn().mockResolvedValue(mockSession),
    };

    mockAuthService = {
      refreshSession: vi.fn().mockResolvedValue(undefined),
    };

    service = new SpotifyApiClientService(
      mockSessionStore as SessionStoreService,
      mockAuthService as AuthService,
    );
  });

  it('obtiene y normaliza las mejores pistas exitosamente', async () => {
    const paginatedTracks: SpotifyPaginatedResponse<SpotifyRawTrack> = {
      items: [mockRawTrack],
      total: 1,
      limit: 50,
      offset: 0,
      href: 'https://api.spotify.com/v1/me/top/tracks',
      previous: null,
      next: null,
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: paginatedTracks });

    const result = await service.getTopTracks('session_123', 'short_term', 10);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Crimen');
    expect(result[0].primaryArtistId).toBe('art_cerati');
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/top/tracks',
      expect.objectContaining({
        headers: { Authorization: 'Bearer valid_access_token_123' },
        params: { time_range: 'short_term', limit: 10 },
      }),
    );
  });

  it('obtiene y normaliza los mejores artistas exitosamente', async () => {
    const paginatedArtists: SpotifyPaginatedResponse<SpotifyRawArtist> = {
      items: [mockRawArtist],
      total: 1,
      limit: 50,
      offset: 0,
      href: 'https://api.spotify.com/v1/me/top/artists',
      previous: null,
      next: null,
    };

    vi.mocked(axios.get).mockResolvedValueOnce({ data: paginatedArtists });

    const result = await service.getTopArtists('session_123', 'medium_term', 50);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Gustavo Cerati');
    expect(result[0].timeMetric.mode).toBe('verified_play_time');
    expect(axios.get).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/top/artists',
      expect.objectContaining({
        headers: { Authorization: 'Bearer valid_access_token_123' },
        params: { time_range: 'medium_term', limit: 50 },
      }),
    );
  });

  it('obtiene el resumen completo de tracks y artistas en paralelo', async () => {
    const paginatedTracks: SpotifyPaginatedResponse<SpotifyRawTrack> = {
      items: [mockRawTrack],
      total: 1,
      limit: 50,
      offset: 0,
      href: 'https://api.spotify.com/v1/me/top/tracks',
      previous: null,
      next: null,
    };

    const paginatedArtists: SpotifyPaginatedResponse<SpotifyRawArtist> = {
      items: [mockRawArtist],
      total: 1,
      limit: 50,
      offset: 0,
      href: 'https://api.spotify.com/v1/me/top/artists',
      previous: null,
      next: null,
    };

    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: paginatedTracks })
      .mockResolvedValueOnce({ data: paginatedArtists });

    const summary = await service.getTopMusicSummary('session_123', 'long_term');

    expect(summary.timeRange).toBe('long_term');
    expect(summary.totalTracks).toBe(1);
    expect(summary.totalArtists).toBe(1);
    expect(summary.tracks[0].title).toBe('Crimen');
    expect(summary.artists[0].name).toBe('Gustavo Cerati');
    // Como mockRawTrack pertenece a mockRawArtist, las métricas deben correlacionarse
    expect(summary.artists[0].timeMetric.trackCount).toBe(1);
  });

  it('arroja UnauthorizedException si la sesión no existe en el store', async () => {
    vi.mocked(mockSessionStore.getSession!).mockResolvedValueOnce(null);

    await expect(service.getTopTracks('invalid_session')).rejects.toThrow(UnauthorizedException);
  });

  it('reintenta automáticamente y con éxito tras refrescar el token ante un error 401', async () => {
    const error401 = {
      isAxiosError: true,
      response: { status: 401, data: { error: 'The access token expired' } },
    };

    vi.mocked(axios.isAxiosError).mockReturnValue(true);

    const refreshedSession = {
      ...mockSession,
      accessToken: 'new_refreshed_token_789',
    };

    const successResponse = {
      data: {
        items: [mockRawTrack],
        total: 1,
        limit: 50,
        offset: 0,
        href: '',
        previous: null,
        next: null,
      },
    };

    // Primera llamada falla con 401, segunda llamada tiene éxito
    vi.mocked(axios.get).mockRejectedValueOnce(error401).mockResolvedValueOnce(successResponse);

    // Tras el refreshSession, getSession devuelve la sesión actualizada
    vi.mocked(mockSessionStore.getSession!)
      .mockResolvedValueOnce(mockSession)
      .mockResolvedValueOnce(refreshedSession);

    const result = await service.getTopTracks('session_123');

    expect(mockAuthService.refreshSession).toHaveBeenCalledWith('session_123');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Crimen');
  });

  it('arroja UnauthorizedException si el refresco de token también falla ante un 401', async () => {
    const error401 = {
      isAxiosError: true,
      response: { status: 401, data: { error: 'The access token expired' } },
    };

    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(axios.get).mockRejectedValueOnce(error401);
    vi.mocked(mockAuthService.refreshSession!).mockRejectedValueOnce(
      new Error('Refresh token revocado'),
    );

    await expect(service.getTopTracks('session_123')).rejects.toThrow(UnauthorizedException);
  });

  it('maneja el rate limiting de Spotify (HTTP 429) extrayendo Retry-After', async () => {
    const error429 = {
      isAxiosError: true,
      response: {
        status: 429,
        headers: { 'retry-after': '12' },
        data: { error: 'API rate limit exceeded' },
      },
    };

    vi.mocked(axios.isAxiosError).mockReturnValue(true);
    vi.mocked(axios.get).mockRejectedValueOnce(error429);

    try {
      await service.getTopTracks('session_123');
      expect.fail('Debe arrojar HttpException 429');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      const httpErr = err as HttpException;
      expect(httpErr.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      const response = httpErr.getResponse() as Record<string, unknown>;
      expect(response.retryAfterSeconds).toBe(12);
    }
  });
});
