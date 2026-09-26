import { describe, expect, it } from 'vitest';
import {
  normalizeSpotifyArtist,
  normalizeSpotifyArtists,
  normalizeSpotifyTrack,
  normalizeSpotifyTracks,
} from './spotify-normalizer.util';
import { SpotifyRawArtist, SpotifyRawTrack } from './spotify.types';

describe('spotify-normalizer.util', () => {
  const mockRawTrack: SpotifyRawTrack = {
    id: 'track_123',
    name: 'Disorder',
    artists: [
      { id: 'art_1', name: 'Joy Division' },
      { id: 'art_2', name: 'Ian Curtis' },
    ],
    album: {
      id: 'alb_1',
      name: 'Unknown Pleasures',
      release_date: '1979-06-15',
      images: [
        { url: 'https://i.scdn.co/image/large.jpg', height: 640, width: 640 },
        { url: 'https://i.scdn.co/image/small.jpg', height: 300, width: 300 },
      ],
    },
    duration_ms: 212000,
    popularity: 78,
    preview_url: 'https://p.scdn.co/mp3-preview/disorder',
  };

  const mockRawArtist: SpotifyRawArtist = {
    id: 'art_1',
    name: 'Joy Division',
    genres: ['post-punk', 'new wave', 'gothic rock'],
    images: [{ url: 'https://i.scdn.co/image/artist.jpg', height: 640, width: 640 }],
    popularity: 75,
    followers: { total: 1200000 },
  };

  it('normaliza correctamente un track de Spotify con todos sus metadatos', () => {
    const result = normalizeSpotifyTrack(mockRawTrack);

    expect(result.id).toBe('track_123');
    expect(result.title).toBe('Disorder');
    expect(result.artistNames).toEqual(['Joy Division', 'Ian Curtis']);
    expect(result.primaryArtistId).toBe('art_1');
    expect(result.albumName).toBe('Unknown Pleasures');
    expect(result.releaseDate).toBe('1979-06-15');
    expect(result.durationMs).toBe(212000);
    expect(result.popularity).toBe(78);
    expect(result.imageUrl).toBe('https://i.scdn.co/image/large.jpg');
    expect(result.previewUrl).toBe('https://p.scdn.co/mp3-preview/disorder');
  });

  it('maneja tracks sin imágenes de álbum o sin previewUrl de manera segura', () => {
    const rawTrackNoImages: SpotifyRawTrack = {
      ...mockRawTrack,
      album: {
        ...mockRawTrack.album,
        images: [],
      },
      preview_url: null,
    };

    const result = normalizeSpotifyTrack(rawTrackNoImages);
    expect(result.imageUrl).toBe('');
    expect(result.previewUrl).toBeNull();
  });

  it('normaliza una lista completa de tracks', () => {
    const tracks = normalizeSpotifyTracks([mockRawTrack, { ...mockRawTrack, id: 'track_456' }]);
    expect(tracks).toHaveLength(2);
    expect(tracks[0].id).toBe('track_123');
    expect(tracks[1].id).toBe('track_456');
  });

  it('normaliza un artista calculando tiempo real cuando existen tracks coincidentes', () => {
    const normalizedTracks = normalizeSpotifyTracks([
      mockRawTrack, // 212,000 ms (~3.53 min)
      { ...mockRawTrack, id: 'track_999', duration_ms: 188000 }, // 188,000 ms (~3.13 min)
    ]);

    const result = normalizeSpotifyArtist(mockRawArtist, 0, normalizedTracks);

    expect(result.id).toBe('art_1');
    expect(result.name).toBe('Joy Division');
    expect(result.imageUrl).toBe('https://i.scdn.co/image/artist.jpg');
    expect(result.genres).toEqual(['post-punk', 'new wave', 'gothic rock']);
    expect(result.timeMetric.mode).toBe('verified_play_time');
    expect(result.timeMetric.trackCount).toBe(2);
    // (212000 + 188000) / 60000 = 400000 / 60000 = 6.666 -> 7 min
    expect(result.timeMetric.totalMinutes).toBe(7);
    expect(result.timeMetric.formattedTime).toBe('7 min');
    expect(result.timeMetric.legend).toContain('#1');
  });

  it('asigna métrica estimada proporcional al ranking cuando el artista no tiene tracks en el top', () => {
    const result = normalizeSpotifyArtist(mockRawArtist, 5, []);

    expect(result.timeMetric.trackCount).toBe(1);
    expect(result.timeMetric.totalMinutes).toBeGreaterThanOrEqual(15);
    expect(result.timeMetric.formattedTime).toBe(`${result.timeMetric.totalMinutes} min`);
    expect(result.timeMetric.legend).toContain('#6');
  });

  it('normaliza una lista ordenada de artistas', () => {
    const artists = normalizeSpotifyArtists([
      mockRawArtist,
      { ...mockRawArtist, id: 'art_2', name: 'The Cure' },
    ]);

    expect(artists).toHaveLength(2);
    expect(artists[0].name).toBe('Joy Division');
    expect(artists[1].name).toBe('The Cure');
    expect(artists[1].timeMetric.legend).toContain('#2');
  });
});
