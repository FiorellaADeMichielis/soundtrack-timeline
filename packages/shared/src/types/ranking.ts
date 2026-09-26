import { ElementalArchetype } from './elemental';

export type RankingMetricType = 'verified_play_time' | 'top_catalog_duration';

export interface TimeValidationMetric {
  readonly mode: RankingMetricType;
  readonly totalMinutes: number;
  readonly formattedTime: string;
  readonly trackCount: number;
  readonly legend: string;
}

export interface RankedAlbum {
  readonly id: string;
  readonly title: string;
  readonly artistName: string;
  readonly releaseYear: string;
  readonly imageUrl: string;
  readonly timeMetric: TimeValidationMetric;
}

export interface RankedArtist {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly genres: readonly string[];
  readonly timeMetric: TimeValidationMetric;
}

export interface RankedGenre {
  readonly name: string;
  readonly trackCount: number;
  readonly percentage: number;
  readonly associatedElement: ElementalArchetype;
  readonly timeMetric: TimeValidationMetric;
}

export type RankingType = 'artists' | 'albums' | 'genres';
export type RankingTimeRange = 'week' | 'month' | 'year' | 'all_time';
export type RankingLimit = 3 | 5 | 10;

export interface RankingsResponse<T = RankedArtist | RankedAlbum | RankedGenre> {
  readonly type: RankingType;
  readonly timeRange: RankingTimeRange;
  readonly limit: RankingLimit;
  readonly items: readonly T[];
}
