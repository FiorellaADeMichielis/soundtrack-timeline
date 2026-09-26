import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { CompleteUserProfileSummary, DEFAULT_ELEMENT_INSIGHTS } from '@soundtrack-timeline/shared';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let mockAnalyticsService: Partial<AnalyticsService>;

  const mockSummary: CompleteUserProfileSummary = {
    userId: 'usr_gustavo',
    timeRange: 'medium_term',
    generatedAt: new Date().toISOString(),
    element: DEFAULT_ELEMENT_INSIGHTS['fuego'],
    psychometrics: {
      openness: 80,
      conscientiousness: 60,
      extraversion: 70,
      agreeableness: 65,
      neuroticism: 75,
    },
    book: {
      title: 'Fahrenheit 451',
      author: 'Ray Bradbury',
      coverUrl: 'https://example.com/cover.jpg',
      openLibraryKey: '/works/OL27479W',
      matchedMood: 'Resistencia & Furia',
      connectionReason: 'Combustión lírica',
    },
    character: {
      id: 'char_tyler',
      name: 'Tyler Durden',
      origin: 'Fight Club',
      type: 'fictional',
      affinityPercentage: 91.2,
      sharedTraits: ['Rebeldía'],
      avatarUrl: '/assets/tyler.webp',
    },
    timelineBuckets: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockAnalyticsService = {
      generateUserProfileSummary: vi.fn().mockResolvedValue(mockSummary),
    };

    controller = new AnalyticsController(mockAnalyticsService as AnalyticsService);
  });

  const createMockRequest = (sessionId?: string): Request => {
    return {
      cookies: sessionId ? { st_session: sessionId } : {},
    } as unknown as Request;
  };

  it('obtiene el perfil analítico completo cuando la sesión es válida', async () => {
    const req = createMockRequest('valid_session');
    const result = await controller.getProfileSummary(req, 'short_term');

    expect(result).toEqual(mockSummary);
    expect(mockAnalyticsService.generateUserProfileSummary).toHaveBeenCalledWith(
      'valid_session',
      'short_term',
    );
  });

  it('arroja UnauthorizedException si la cookie st_session está ausente', async () => {
    const req = createMockRequest(undefined);

    await expect(controller.getProfileSummary(req)).rejects.toThrow(UnauthorizedException);
  });

  it('arroja BadRequestException si se provee un timeRange inválido', async () => {
    const req = createMockRequest('valid_session');

    await expect(controller.getProfileSummary(req, 'invalid_range')).rejects.toThrow(
      BadRequestException,
    );
  });
});
