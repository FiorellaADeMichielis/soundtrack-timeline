import { describe, expect, it } from 'vitest';
import { RankedArtist, Track } from '@soundtrack-timeline/shared';
import { calculateOceanTraits } from './psychometrics.util';

describe('psychometrics.util', () => {
  const createMockTrack = (title: string, popularity: number, durationMs: number): Track => ({
    id: `trk_${title}`,
    title,
    artistNames: ['Artist A'],
    primaryArtistId: 'art_a',
    albumName: 'Album A',
    releaseDate: '2020-01-01',
    durationMs,
    popularity,
    imageUrl: 'https://example.com/cover.jpg',
    previewUrl: null,
  });

  const createMockArtist = (name: string, genres: string[]): RankedArtist => ({
    id: `art_${name}`,
    name,
    imageUrl: 'https://example.com/artist.jpg',
    genres,
    timeMetric: {
      mode: 'verified_play_time',
      totalMinutes: 30,
      formattedTime: '30 min',
      trackCount: 3,
      legend: 'Rotación',
    },
  });

  it('retorna valores basales neutrales cuando no hay pistas ni artistas', () => {
    const traits = calculateOceanTraits([], []);

    expect(traits).toEqual({
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    });
  });

  it('infiere alto neuroticismo y apertura para un perfil post-punk/dark wave', () => {
    const tracks = [
      createMockTrack('Disorder', 45, 212000),
      createMockTrack('She Lost Control', 40, 235000),
      createMockTrack('Atmosphere', 48, 250000),
    ];

    const artists = [
      createMockArtist('Joy Division', ['post-punk', 'dark wave', 'goth']),
      createMockArtist('Bauhaus', ['goth rock', 'post-punk']),
    ];

    const traits = calculateOceanTraits(tracks, artists);

    expect(traits.neuroticism).toBeGreaterThan(60);
    expect(traits.openness).toBeGreaterThan(55);
  });

  it('infiere alta extraversión para un perfil pop / dance de alta popularidad', () => {
    const tracks = [
      createMockTrack('Dance Track 1', 88, 195000),
      createMockTrack('Dance Track 2', 92, 180000),
    ];

    const artists = [
      createMockArtist('Pop Star', ['pop', 'dance', 'electronic']),
      createMockArtist('DJ Star', ['house', 'edm']),
    ];

    const traits = calculateOceanTraits(tracks, artists);

    expect(traits.extraversion).toBeGreaterThan(60);
  });

  it('infiere alta amabilidad para un perfil folk / acústico', () => {
    const tracks = [
      createMockTrack('Acoustic Song 1', 35, 210000),
      createMockTrack('Acoustic Song 2', 38, 225000),
    ];

    const artists = [
      createMockArtist('Folk Singer', ['indie folk', 'acoustic', 'singer-songwriter']),
    ];

    const traits = calculateOceanTraits(tracks, artists);

    expect(traits.agreeableness).toBeGreaterThan(55);
  });

  it('mantiene todos los valores dentro del rango acotado [15, 95]', () => {
    const extremeTracks = Array.from({ length: 50 }, (_, i) =>
      createMockTrack(`Track ${i}`, 100, 180000),
    );
    const extremeArtists = Array.from({ length: 20 }, (_, i) =>
      createMockArtist(`Artist ${i}`, ['pop', 'dance', 'techno', 'house']),
    );

    const traits = calculateOceanTraits(extremeTracks, extremeArtists);

    for (const [key, value] of Object.entries(traits)) {
      expect(value, `Trait ${key} debe estar entre 15 y 95`).toBeGreaterThanOrEqual(15);
      expect(value, `Trait ${key} debe estar entre 15 y 95`).toBeLessThanOrEqual(95);
      expect(Number.isInteger(value), `Trait ${key} debe ser entero`).toBe(true);
    }
  });
});
