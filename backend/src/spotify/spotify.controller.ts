import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { RankedArtist, Track } from '@soundtrack-timeline/shared';
import { SpotifyApiClientService } from './spotify-api-client.service';
import { SpotifyTimeRange, TopMusicSummaryResponse } from './spotify.types';

const VALID_TIME_RANGES: readonly SpotifyTimeRange[] = ['short_term', 'medium_term', 'long_term'];

@Controller('api/spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyApiClientService) {}

  /**
   * Obtiene las pistas más escuchadas del usuario en el rango temporal indicado.
   */
  @Get('top-tracks')
  async getTopTracks(
    @Req() req: Request,
    @Query('timeRange') timeRange?: string,
    @Query('limit') limitStr?: string,
  ): Promise<Track[]> {
    const sessionId = this.extractSessionId(req);
    const parsedRange = this.parseTimeRange(timeRange);
    const limit = limitStr ? Math.min(50, Math.max(1, parseInt(limitStr, 10))) : 50;

    return this.spotifyService.getTopTracks(sessionId, parsedRange, limit);
  }

  /**
   * Obtiene los artistas más escuchados del usuario en el rango temporal indicado.
   */
  @Get('top-artists')
  async getTopArtists(
    @Req() req: Request,
    @Query('timeRange') timeRange?: string,
    @Query('limit') limitStr?: string,
  ): Promise<RankedArtist[]> {
    const sessionId = this.extractSessionId(req);
    const parsedRange = this.parseTimeRange(timeRange);
    const limit = limitStr ? Math.min(50, Math.max(1, parseInt(limitStr, 10))) : 50;

    return this.spotifyService.getTopArtists(sessionId, parsedRange, limit);
  }

  /**
   * Obtiene la síntesis musical combinada de pistas y artistas normalizados.
   */
  @Get('top-summary')
  async getTopSummary(
    @Req() req: Request,
    @Query('timeRange') timeRange?: string,
  ): Promise<TopMusicSummaryResponse> {
    const sessionId = this.extractSessionId(req);
    const parsedRange = this.parseTimeRange(timeRange);

    return this.spotifyService.getTopMusicSummary(sessionId, parsedRange);
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
