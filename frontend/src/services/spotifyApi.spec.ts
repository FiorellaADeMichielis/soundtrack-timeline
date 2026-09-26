import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { spotifyApi } from './spotifyApi';
import { RankedArtist, Track } from '@soundtrack-timeline/shared';

describe('spotifyApi', () => {
  const originalFetch = globalThis.fetch;

  const mockTrack: Track = {
    id: 'trk_1',
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
      legend: 'Atribución analítica (#1)',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetchTopSummary obtiene la síntesis musical exitosamente', async () => {
    const mockSummary = {
      timeRange: 'medium_term',
      totalTracks: 1,
      totalArtists: 1,
      tracks: [mockTrack],
      artists: [mockArtist],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockSummary),
    });

    const result = await spotifyApi.fetchTopSummary('medium_term');

    expect(result).toEqual(mockSummary);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/spotify/top-summary?timeRange=medium_term'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('fetchTopSummary retorna null si la respuesta no es exitosa', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const result = await spotifyApi.fetchTopSummary();
    expect(result).toBeNull();
  });

  it('fetchTopTracks retorna tracks cuando la llamada es exitosa', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([mockTrack]),
    });

    const result = await spotifyApi.fetchTopTracks('short_term', 20);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Crimen');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/spotify/top-tracks?timeRange=short_term&limit=20'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('fetchTopTracks retorna array vacío ante fallo de red', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

    const result = await spotifyApi.fetchTopTracks();
    expect(result).toEqual([]);
  });

  it('fetchTopArtists retorna artists cuando la llamada es exitosa', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([mockArtist]),
    });

    const result = await spotifyApi.fetchTopArtists('long_term', 50);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Gustavo Cerati');
  });

  it('fetchTopArtists retorna array vacío cuando no es ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await spotifyApi.fetchTopArtists();
    expect(result).toEqual([]);
  });
});
