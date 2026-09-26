import { RankedArtist, Track } from '@soundtrack-timeline/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type SpotifyClientTimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface TopSummaryApiResponse {
  readonly timeRange: SpotifyClientTimeRange;
  readonly totalTracks: number;
  readonly totalArtists: number;
  readonly tracks: readonly Track[];
  readonly artists: readonly RankedArtist[];
}

export const spotifyApi = {
  /**
   * Obtiene la síntesis musical de pistas y artistas normalizados para el usuario autenticado.
   */
  async fetchTopSummary(
    timeRange: SpotifyClientTimeRange = 'medium_term',
  ): Promise<TopSummaryApiResponse | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/spotify/top-summary?timeRange=${timeRange}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as TopSummaryApiResponse;
    } catch {
      return null;
    }
  },

  /**
   * Obtiene las pistas más escuchadas del usuario autenticado.
   */
  async fetchTopTracks(
    timeRange: SpotifyClientTimeRange = 'medium_term',
    limit = 50,
  ): Promise<readonly Track[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/spotify/top-tracks?timeRange=${timeRange}&limit=${limit}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        return [];
      }

      return (await response.json()) as readonly Track[];
    } catch {
      return [];
    }
  },

  /**
   * Obtiene los artistas más escuchados del usuario autenticado.
   */
  async fetchTopArtists(
    timeRange: SpotifyClientTimeRange = 'medium_term',
    limit = 50,
  ): Promise<readonly RankedArtist[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/spotify/top-artists?timeRange=${timeRange}&limit=${limit}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        return [];
      }

      return (await response.json()) as readonly RankedArtist[];
    } catch {
      return [];
    }
  },
};
