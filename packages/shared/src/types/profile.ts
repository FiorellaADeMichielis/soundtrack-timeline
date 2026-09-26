import { ElementInsight } from './elemental';
import { OceanTraits, CulturalArchetype } from './psychometrics';
import { BookRecommendation } from './culture';
import { TimelineBucket } from './timeline';

export interface CompleteUserProfileSummary {
  readonly userId: string;
  readonly timeRange: string;
  readonly generatedAt: string;
  readonly element: ElementInsight;
  readonly psychometrics: OceanTraits;
  readonly book: BookRecommendation;
  readonly character: CulturalArchetype;
  readonly timelineBuckets: readonly TimelineBucket[];
}
