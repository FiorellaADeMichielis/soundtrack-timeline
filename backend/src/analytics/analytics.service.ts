import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CompleteUserProfileSummary } from '@soundtrack-timeline/shared';
import { SessionStoreService } from '../auth/session-store.service';
import { SpotifyApiClientService } from '../spotify/spotify-api-client.service';
import { SpotifyTimeRange } from '../spotify/spotify.types';
import { CultureConnectorService } from './culture-connector.service';
import { classifyElementalArchetype } from './elemental-classifier.util';
import { calculateOceanTraits } from './psychometrics.util';
import { generateTimelineBuckets } from './timeline-generator.util';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly spotifyClient: SpotifyApiClientService,
    private readonly cultureConnector: CultureConnectorService,
    private readonly sessionStore: SessionStoreService,
  ) {}

  /**
   * Orquesta la generación completa del perfil analítico y editorial del usuario:
   * 1. Consulta el catálogo normalizado de Spotify.
   * 2. Infiere el vector psicométrico OCEAN.
   * 3. Clasifica el arquetipo elemental y calcula su dominancia.
   * 4. Enlaza con el arquetipo cultural y recomendación de libro en Open Library.
   * 5. Segmenta las pistas en buckets cromáticos de timeline.
   */
  async generateUserProfileSummary(
    sessionId: string,
    timeRange: SpotifyTimeRange = 'medium_term',
  ): Promise<CompleteUserProfileSummary> {
    const session = await this.sessionStore.getSession(sessionId);
    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada o expirada. Por favor inicie sesión.');
    }

    this.logger.log(
      `Generando perfil analítico para el usuario ${session.userId} (Rango: ${timeRange})`,
    );

    // 1. Obtener síntesis musical de Spotify
    const musicSummary = await this.spotifyClient.getTopMusicSummary(sessionId, timeRange);

    // 2. Inferencia psicométrica Big Five
    const psychometrics = calculateOceanTraits(musicSummary.tracks, musicSummary.artists);

    // 3. Clasificación de arquetipo elemental
    const element = classifyElementalArchetype(psychometrics, musicSummary.artists);

    // 4. Conexión cultural (Arquetipo y Literatura en paralelo)
    const character = this.cultureConnector.matchCulturalArchetype(psychometrics);
    const book = await this.cultureConnector.recommendBook(element.primaryElement, psychometrics);

    // 5. Segmentación del Timeline
    const timelineBuckets = generateTimelineBuckets(musicSummary.tracks, element.primaryElement);

    return {
      userId: session.userId,
      timeRange,
      generatedAt: new Date().toISOString(),
      element,
      psychometrics,
      book,
      character,
      timelineBuckets,
    };
  }
}
