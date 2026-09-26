import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SpotifyController } from './spotify.controller';
import { SpotifyApiClientService } from './spotify-api-client.service';
import { RankedArtist, Track } from '@soundtrack-timeline/shared';

describe('SpotifyController', () => {
  let controller: SpotifyController;
  let mockSpotifyService: Partial<SpotifyApiClientService>;

  const mockTrack: Track = {
    id: 'track_1',
    title: 'Crimen',
    artistNames: ['Gustavo Cerati'],
    primaryArtistId: 'art_1',
    albumName: 'Ahí Vamos',
    releaseDate: '2006-04-04',
    durationMs: 228000,
    popularity: 85,
    imageUrl: 'https://i.scdn.co/image/cerati.jpg',
    previewUrl: null,
  };

  const mockArtist: RankedArtist = {
    id: 'art_1',
    name: 'Gustavo Cerati',
    imageUrl: 'https://i.scdn.co/image/cerati.jpg',
    genres: ['argentine rock'],
    timeMetric: {
      mode: 'verified_play_time',
      totalMinutes: 25,
      formattedTime: '25 min',
      trackCount: 3,
      legend: 'Atribución analítica por rotación (#1)',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSpotifyService = {
      getTopTracks: vi.fn().mockResolvedValue([mockTrack]),
      getTopArtists: vi.fn().mockResolvedValue([mockArtist]),
      getTopMusicSummary: vi.fn().mockResolvedValue({
        timeRange: 'medium_term',
        totalTracks: 1,
        totalArtists: 1,
        tracks: [mockTrack],
        artists: [mockArtist],
      }),
    };

    controller = new SpotifyController(mockSpotifyService as SpotifyApiClientService);
  });

  const createMockRequest = (sessionId?: string): Request => {
    return {
      cookies: sessionId ? { st_session: sessionId } : {},
    } as unknown as Request;
  };

  it('obtiene pistas destacadas cuando la sesión es válida', async () => {
    const req = createMockRequest('valid_session');
    const result = await controller.getTopTracks(req, 'short_term', '20');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Crimen');
    expect(mockSpotifyService.getTopTracks).toHaveBeenCalledWith('valid_session', 'short_term', 20);
  });

  it('obtiene artistas destacados cuando la sesión es válida', async () => {
    const req = createMockRequest('valid_session');
    const result = await controller.getTopArtists(req, 'long_term');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Gustavo Cerati');
    expect(mockSpotifyService.getTopArtists).toHaveBeenCalledWith('valid_session', 'long_term', 50);
  });

  it('obtiene el resumen musical completo cuando la sesión es válida', async () => {
    const req = createMockRequest('valid_session');
    const result = await controller.getTopSummary(req, 'medium_term');

    expect(result.tracks).toHaveLength(1);
    expect(result.artists).toHaveLength(1);
    expect(result.timeRange).toBe('medium_term');
    expect(mockSpotifyService.getTopMusicSummary).toHaveBeenCalledWith(
      'valid_session',
      'medium_term',
    );
  });

  it('arroja UnauthorizedException si no existe cookie st_session en la solicitud', async () => {
    const req = createMockRequest(undefined);

    await expect(controller.getTopTracks(req)).rejects.toThrow(UnauthorizedException);
    await expect(controller.getTopArtists(req)).rejects.toThrow(UnauthorizedException);
    await expect(controller.getTopSummary(req)).rejects.toThrow(UnauthorizedException);
  });

  it('arroja BadRequestException si se provee un timeRange inválido', async () => {
    const req = createMockRequest('valid_session');

    await expect(controller.getTopTracks(req, 'invalid_term')).rejects.toThrow(BadRequestException);
  });
});
