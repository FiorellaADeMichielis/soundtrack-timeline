import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CompleteUserProfileSummary } from '@soundtrack-timeline/shared';
import { SpotifyTimeRange } from '../spotify/spotify.types';
import { AnalyticsService } from './analytics.service';

const VALID_TIME_RANGES: readonly SpotifyTimeRange[] = ['short_term', 'medium_term', 'long_term'];

@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Genera y retorna el perfil analítico completo del usuario autenticado:
   * Síntesis musical, OCEAN traits, Arquetipo elemental, Arquetipo cultural,
   * Recomendación de lectura en Open Library y segmentación del Timeline.
   */
  @Get('profile-summary')
  async getProfileSummary(
    @Req() req: Request,
    @Query('timeRange') timeRange?: string,
  ): Promise<CompleteUserProfileSummary> {
    const sessionId = this.extractSessionId(req);
    const parsedRange = this.parseTimeRange(timeRange);

    return this.analyticsService.generateUserProfileSummary(sessionId, parsedRange);
  }

  private extractSessionId(req: Request): string {
    const sessionId = req.cookies?.st_session as string | undefined;

    if (!sessionId) {
      throw new UnauthorizedException(
        'No se encontró una sesión activa de Spotify. Por favor inicie sesión.',
      );
    }

    return sessionId;
  }

  private parseTimeRange(timeRange?: string): SpotifyTimeRange {
    if (!timeRange) {
      return 'medium_term';
    }

    if (!VALID_TIME_RANGES.includes(timeRange as SpotifyTimeRange)) {
      throw new BadRequestException(
        `Rango temporal inválido: '${timeRange}'. Debe ser 'short_term', 'medium_term' o 'long_term'.`,
      );
    }

    return timeRange as SpotifyTimeRange;
  }
}
