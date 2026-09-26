export interface BookRecommendation {
  readonly title: string;
  readonly author: string;
  readonly coverUrl: string;
  readonly openLibraryKey: string;
  readonly matchedMood: string;
  readonly connectionReason: string;
}
