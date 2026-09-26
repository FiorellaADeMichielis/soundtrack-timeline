export interface Track {
  readonly id: string;
  readonly title: string;
  readonly artistNames: readonly string[];
  readonly primaryArtistId: string;
  readonly albumName: string;
  readonly releaseDate: string;
  readonly durationMs: number;
  readonly popularity: number;
  readonly imageUrl: string;
  readonly previewUrl: string | null;
}
