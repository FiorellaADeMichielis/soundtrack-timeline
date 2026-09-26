import { ElementInsight } from './elemental';
import { RankedAlbum, RankedArtist } from './ranking';
import { Track } from './track';
import { OceanTraits, CulturalArchetype } from './psychometrics';
import { BookRecommendation } from './culture';

export type PosterThemeId = 'swiss' | 'neon' | 'receipt';

export interface PosterConfig {
  readonly theme: PosterThemeId;
  readonly customTitle: string;
  readonly customSubtitle: string;
  readonly showRadar: boolean;
  readonly showBook: boolean;
  readonly showArchetype: boolean;
  readonly showTimeBadges: boolean;
  readonly targetDpi: 150 | 300;
}

export interface PosterRenderData {
  readonly userName: string;
  readonly timeRangeLabel: string;
  readonly generatedDate: string;
  readonly element: ElementInsight;
  readonly topTracks: readonly Track[];
  readonly topArtists: readonly RankedArtist[];
  readonly topAlbums: readonly RankedAlbum[];
  readonly ocean: OceanTraits;
  readonly book: BookRecommendation;
  readonly archetype: CulturalArchetype;
}
