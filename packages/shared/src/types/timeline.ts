import { ElementalArchetype } from './elemental';

export interface TimelineNode {
  readonly trackId: string;
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  readonly playedAt: string;
  readonly durationMs: number;
  readonly primaryGenre: string;
  readonly element: ElementalArchetype;
  readonly imageUrl: string;
}

export interface TimelineBucket {
  readonly bucketKey: string;
  readonly label: string;
  readonly tracks: readonly TimelineNode[];
  readonly dominantElement: ElementalArchetype;
  readonly totalMinutes: number;
}

export interface TimelineSummary {
  readonly totalTracks: number;
  readonly totalMinutes: number;
  readonly dateRange: {
    readonly from: string;
    readonly to: string;
  };
  readonly buckets: readonly TimelineBucket[];
}
