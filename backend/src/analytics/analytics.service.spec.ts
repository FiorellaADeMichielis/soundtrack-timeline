import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SessionStoreService, UserSessionData } from '../auth/session-store.service';
import { SpotifyApiClientService } from '../spotify/spotify-api-client.service';
import { CultureConnectorService } from './culture-connector.service';
import { RankedArtist, Track } from '@soundtrack-timeline/shared';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockSpotifyClient: Partial<SpotifyApiClientService>;
  let mockCultureConnector: Partial<CultureConnectorService>;
  let mockSessionStore: Partial<SessionStoreService>;

  const mockSession: UserSessionData = {
    sessionId: 'sess_1',
    userId: 'usr_gustavo',
    displayName: 'Gustavo Cerati',
    accessToken: 'access_123',
    expiresAt: Date.now() + 3600000,
  };

  const mockTrack: Track = {
    id: 'trk_1',
    title: 'Puente',
    artistNames: ['Gustavo Cerati'],
    primaryArtistId: 'art_cerati',
    albumName: 'Bocanada',
    releaseDate: '1999-06-28',
    durationMs: 273000,
    popularity: 82,
    imageUrl: 'https://example.com/bocanada.jpg',
    previewUrl: null,
  };

  const mockArtist: RankedArtist = {
    id: 'art_cerati',
    name: 'Gustavo Cerati',
    imageUrl: 'https://example.com/cerati.jpg',
    genres: ['argentine rock', 'art rock'],
    timeMetric: {
      mode: 'verified_play_time',
      totalMinutes: 35,
      formattedTime: '35 min',
      trackCount: 4,
      legend: 'Rotación',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockSessionStore = {
      getSession: vi.fn().mockResolvedValue(mockSession),
    };

    mockSpotifyClient = {
      getTopMusicSummary: vi.fn().mockResolvedValue({
        timeRange: 'medium_term',
        totalTracks: 1,
        totalArtists: 1,
        tracks: [mockTrack],
        artists: [mockArtist],
      }),
    };

    mockCultureConnector = {
      matchCulturalArchetype: vi.fn().mockReturnValue({
        id: 'char_borges',
        name: 'Jorge Luis Borges',
        origin: 'Escritor y Poeta Argentino',
        type: 'historical',
        affinityPercentage: 92.5,
        sharedTraits: ['Metafísica', 'Laberintos'],
        avatarUrl: '/assets/archetypes/borges.webp',
      }),
      recommendBook: vi.fn().mockResolvedValue({
        title: 'Ficciones',
        author: 'Jorge Luis Borges',
        coverUrl: 'https://covers.openlibrary.org/b/id/12833521-L.jpg',
        openLibraryKey: '/works/OL18143235W',
        matchedMood: 'Melancolía & Laberinto',
        connectionReason: 'Mareas de memoria infinita',
      }),
    };

    service = new AnalyticsService(
      mockSpotifyClient as SpotifyApiClientService,
      mockCultureConnector as CultureConnectorService,
      mockSessionStore as SessionStoreService,
    );
  });

  it('genera exitosamente el perfil analítico completo del usuario', async () => {
    const summary = await service.generateUserProfileSummary('sess_1', 'short_term');

    expect(summary).toBeDefined();
    expect(summary.userId).toBe('usr_gustavo');
    expect(summary.timeRange).toBe('short_term');
    expect(summary.generatedAt).toBeDefined();
    expect(summary.element.primaryElement).toBeDefined();
    expect(summary.psychometrics.openness).toBeGreaterThanOrEqual(15);
    expect(summary.book.title).toBe('Ficciones');
    expect(summary.character.name).toBe('Jorge Luis Borges');
    expect(summary.timelineBuckets.length).toBeGreaterThan(0);
  });

  it('arroja UnauthorizedException si la sesión es inválida o inexistente', async () => {
    vi.mocked(mockSessionStore.getSession!).mockResolvedValueOnce(null);

    await expect(service.generateUserProfileSummary('invalid_sess')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
