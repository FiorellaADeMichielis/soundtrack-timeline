import {
  ElementalArchetype,
  TimelineBucket,
  TimelineNode,
  Track,
} from '@soundtrack-timeline/shared';

const BUCKET_DEFINITIONS: readonly {
  readonly key: string;
  readonly label: string;
  readonly startIdx: number;
  readonly endIdx: number;
}[] = [
  { key: 'tier_1', label: 'Núcleo de Rotación', startIdx: 0, endIdx: 10 },
  { key: 'tier_2', label: 'Expansión Sonora', startIdx: 10, endIdx: 25 },
  { key: 'tier_3', label: 'Atmósfera & Textura', startIdx: 25, endIdx: 40 },
  { key: 'tier_4', label: 'Resonancia Profunda', startIdx: 40, endIdx: 50 },
];

/**
 * Agrupa las pistas del usuario en segmentos cronológicos y temáticos (TimelineBuckets)
 * para la visualización del Timeline cromático.
 */
export function generateTimelineBuckets(
  tracks: readonly Track[],
  dominantElement: ElementalArchetype,
): TimelineBucket[] {
  if (tracks.length === 0) {
    return [];
  }

  const buckets: TimelineBucket[] = [];

  for (const def of BUCKET_DEFINITIONS) {
    const sliceTracks = tracks.slice(def.startIdx, def.endIdx);
    if (sliceTracks.length === 0) {
      continue;
    }

    const nodes: TimelineNode[] = sliceTracks.map((track) => ({
      trackId: track.id,
      title: track.title,
      artist: track.artistNames.join(', '),
      album: track.albumName,
      playedAt: track.releaseDate,
      durationMs: track.durationMs,
      primaryGenre: track.artistNames[0] ?? 'Alternative',
      element: dominantElement,
      imageUrl: track.imageUrl,
    }));

    const totalMinutes = Math.round(nodes.reduce((acc, n) => acc + n.durationMs, 0) / 60000);

    buckets.push({
      bucketKey: def.key,
      label: def.label,
      tracks: nodes,
      dominantElement,
      totalMinutes,
    });
  }

  return buckets;
}
