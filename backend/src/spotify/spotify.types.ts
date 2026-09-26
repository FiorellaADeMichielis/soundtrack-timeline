export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyImage {
  readonly url: string;
  readonly height: number | null;
  readonly width: number | null;
}

export interface SpotifyArtistSimplified {
  readonly id: string;
  readonly name: string;
}

export interface SpotifyAlbumSimplified {
  readonly id: string;
  readonly name: string;
  readonly release_date: string;
  readonly images: readonly SpotifyImage[];
}

export interface SpotifyRawTrack {
  readonly id: string;
  readonly name: string;
  readonly artists: readonly SpotifyArtistSimplified[];
  readonly album: SpotifyAlbumSimplified;
  readonly duration_ms: number;
  readonly popularity: number;
  readonly preview_url: string | null;
  readonly external_urls?: { readonly spotify?: string };
}

export interface SpotifyRawArtist {
  readonly id: string;
  readonly name: string;
  readonly genres: readonly string[];
  readonly images: readonly SpotifyImage[];
  readonly popularity: number;
  readonly followers?: { readonly total: number };
  readonly external_urls?: { readonly spotify?: string };
}

export interface SpotifyPaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly href: string;
  readonly previous: string | null;
  readonly next: string | null;
}

export interface TopMusicSummaryResponse {
  readonly timeRange: SpotifyTimeRange;
  readonly totalTracks: number;
  readonly totalArtists: number;
  readonly tracks: readonly import('@soundtrack-timeline/shared').Track[];
  readonly artists: readonly import('@soundtrack-timeline/shared').RankedArtist[];
}
