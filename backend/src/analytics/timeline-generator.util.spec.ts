import { describe, expect, it } from 'vitest';
import { Track } from '@soundtrack-timeline/shared';
import { generateTimelineBuckets } from './timeline-generator.util';

describe('timeline-generator.util', () => {
  const createMockTrack = (id: string, durationMs = 180000): Track => ({
    id: `trk_${id}`,
    title: `Track ${id}`,
    artistNames: ['Artist One', 'Artist Two'],
    primaryArtistId: 'art_1',
    albumName: 'Sample Album',
    releaseDate: '2023-05-10',
    durationMs,
    popularity: 70,
    imageUrl: 'https://example.com/cover.jpg',
    previewUrl: null,
  });

  it('retorna array vacío cuando no hay pistas', () => {
    const buckets = generateTimelineBuckets([], 'fuego');
    expect(buckets).toEqual([]);
  });

  it('particiona adecuadamente un conjunto de pistas en buckets temporales', () => {
    // 30 pistas: deben generar tier_1 (10), tier_2 (15) y tier_3 (5)
    const tracks = Array.from({ length: 30 }, (_, i) => createMockTrack(String(i + 1), 180000));

    const buckets = generateTimelineBuckets(tracks, 'aire');

    expect(buckets).toHaveLength(3);
    expect(buckets[0].bucketKey).toBe('tier_1');
    expect(buckets[0].tracks).toHaveLength(10);
    // 10 tracks * 180,000 ms = 1,800,000 ms = 30 min
    expect(buckets[0].totalMinutes).toBe(30);
    expect(buckets[0].dominantElement).toBe('aire');

    expect(buckets[1].bucketKey).toBe('tier_2');
    expect(buckets[1].tracks).toHaveLength(15);
    expect(buckets[1].totalMinutes).toBe(45);

    expect(buckets[2].bucketKey).toBe('tier_3');
    expect(buckets[2].tracks).toHaveLength(5);
    expect(buckets[2].totalMinutes).toBe(15);
  });

  it('asigna correctamente las propiedades a cada nodo del timeline', () => {
    const track = createMockTrack('alpha', 240000);
    const buckets = generateTimelineBuckets([track], 'agua');

    expect(buckets).toHaveLength(1);
    const node = buckets[0].tracks[0];

    expect(node.trackId).toBe('trk_alpha');
    expect(node.title).toBe('Track alpha');
    expect(node.artist).toBe('Artist One, Artist Two');
    expect(node.album).toBe('Sample Album');
    expect(node.durationMs).toBe(240000);
    expect(node.element).toBe('agua');
    expect(node.imageUrl).toBe('https://example.com/cover.jpg');
  });
});
