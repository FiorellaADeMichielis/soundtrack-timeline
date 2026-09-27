import { CompleteUserProfileSummary } from '@soundtrack-timeline/shared';
import { SpotifyClientTimeRange } from './spotifyApi';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:4000'
    : 'http://localhost:4000');

export const analyticsApi = {
  /**
   * Obtiene el perfil analítico y editorial integral del usuario autenticado:
   * Síntesis musical, OCEAN traits, Arquetipo elemental, Arquetipo cultural,
   * Recomendación de lectura en Open Library y segmentación del Timeline.
   */
  async fetchUserProfileSummary(
    timeRange: SpotifyClientTimeRange = 'medium_term',
  ): Promise<CompleteUserProfileSummary | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analytics/profile-summary?timeRange=${timeRange}`,
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

      return (await response.json()) as CompleteUserProfileSummary;
    } catch {
      return null;
    }
  },
};
