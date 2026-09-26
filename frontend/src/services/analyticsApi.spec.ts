import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyticsApi } from './analyticsApi';
import { CompleteUserProfileSummary } from '@soundtrack-timeline/shared';

describe('analyticsApi', () => {
  const originalFetch = globalThis.fetch;

  const mockProfileSummary: CompleteUserProfileSummary = {
    userId: 'user_123',
    timeRange: 'medium_term',
    generatedAt: '2026-09-26T18:00:00.000Z',
    element: {
      primaryElement: 'fuego',
      dominancePercentage: 88,
      title: 'Fuego - Intensidad Rítmica',
      poeticDescription: 'Combustión y fuerza sonora',
      iconName: 'flame',
      palette: {
        bgCanvas: '#0A0505',
        bgSurface: '#170A0A',
        accentBrand: '#FF4500',
        textPrimary: '#F5F5F7',
        glowColor: 'rgba(255, 69, 0, 0.4)',
      },
    },
    psychometrics: {
      openness: 85,
      conscientiousness: 60,
      extraversion: 78,
      agreeableness: 65,
      neuroticism: 40,
    },
    book: {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      coverUrl: 'https://covers.openlibrary.org/b/id/10531238-L.jpg',
      openLibraryKey: '/works/OL27479W',
      matchedMood: 'Resistencia & Catarsis',
      connectionReason: 'Combustión lírica y resistencia visceral.',
    },
    character: {
      id: 'arch_tyler',
      name: 'Tyler Durden',
      origin: 'Fight Club',
      type: 'fictional',
      affinityPercentage: 92.4,
      sharedTraits: ['Rebeldía', 'Intensidad'],
      avatarUrl: 'https://images.unsplash.com/tyler.jpg',
    },
    timelineBuckets: [
      {
        bucketKey: 'hyper_rotation',
        label: 'Hiper-Rotación',
        dominantElement: 'fuego',
        totalMinutes: 120,
        tracks: [],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetchUserProfileSummary obtiene el perfil completo exitosamente', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockProfileSummary),
    });

    const result = await analyticsApi.fetchUserProfileSummary('medium_term');

    expect(result).toEqual(mockProfileSummary);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/analytics/profile-summary?timeRange=medium_term'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('fetchUserProfileSummary usa medium_term por defecto', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockProfileSummary),
    });

    await analyticsApi.fetchUserProfileSummary();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/analytics/profile-summary?timeRange=medium_term'),
      expect.any(Object),
    );
  });

  it('fetchUserProfileSummary retorna null si la respuesta no es ok (ej. 401)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const result = await analyticsApi.fetchUserProfileSummary();
    expect(result).toBeNull();
  });

  it('fetchUserProfileSummary retorna null ante fallo de red', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await analyticsApi.fetchUserProfileSummary();
    expect(result).toBeNull();
  });
});
