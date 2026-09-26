import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  BookRecommendation,
  CULTURAL_ARCHETYPES_CATALOG,
  CulturalArchetype,
  ElementalArchetype,
  OceanTraits,
} from '@soundtrack-timeline/shared';

interface CuratedBookTheme {
  readonly searchSubject: string;
  readonly fallbackTitle: string;
  readonly fallbackAuthor: string;
  readonly fallbackCoverUrl: string;
  readonly fallbackKey: string;
  readonly matchedMood: string;
  readonly connectionReason: string;
}

const ELEMENTAL_BOOK_THEMES: Record<ElementalArchetype, CuratedBookTheme> = {
  fuego: {
    searchSubject: 'dystopia rebellion',
    fallbackTitle: 'Fahrenheit 451',
    fallbackAuthor: 'Ray Bradbury',
    fallbackCoverUrl: 'https://covers.openlibrary.org/b/id/10531238-L.jpg',
    fallbackKey: '/works/OL27479W',
    matchedMood: 'Resistencia & Catarsis',
    connectionReason:
      'Combustión lírica y resistencia visceral contra la uniformidad del pensamiento.',
  },
  tierra: {
    searchSubject: 'nature solitude philosophy',
    fallbackTitle: 'Walden',
    fallbackAuthor: 'Henry David Thoreau',
    fallbackCoverUrl: 'https://covers.openlibrary.org/b/id/8235116-L.jpg',
    fallbackKey: '/works/OL262758W',
    matchedMood: 'Arraigo & Serenidad',
    connectionReason:
      'Conexión elemental con los ritmos biológicos, el despojo material y la contemplación orgánica.',
  },
  aire: {
    searchSubject: 'cyberpunk artificial intelligence space',
    fallbackTitle: 'Neuromancer',
    fallbackAuthor: 'William Gibson',
    fallbackCoverUrl: 'https://covers.openlibrary.org/b/id/8315181-L.jpg',
    fallbackKey: '/works/OL27464W',
    matchedMood: 'Neón & Trascendencia',
    connectionReason:
      'Arquitectura de datos, horizontes cibernéticos y la disolución de la frontera analógica.',
  },
  agua: {
    searchSubject: 'labyrinth memory magic realism',
    fallbackTitle: 'Ficciones',
    fallbackAuthor: 'Jorge Luis Borges',
    fallbackCoverUrl: 'https://covers.openlibrary.org/b/id/12833521-L.jpg',
    fallbackKey: '/works/OL18143235W',
    matchedMood: 'Melancolía & Laberinto',
    connectionReason:
      'Mareas de memoria infinita, espejos metafísicos y la suave disolución de la temporalidad lineal.',
  },
};

@Injectable()
export class CultureConnectorService {
  private readonly logger = new Logger(CultureConnectorService.name);
  private readonly openLibraryBaseUrl = 'https://openlibrary.org';

  /**
   * Encuentra el personaje arquetípico cultural con mayor afinidad psicométrica (mínima distancia euclidiana en R^5).
   */
  matchCulturalArchetype(traits: OceanTraits): CulturalArchetype {
    let closestArchetype = CULTURAL_ARCHETYPES_CATALOG[0];
    let minDistance = Number.MAX_VALUE;
    let highestAffinity = 0;

    const maxTheoreticalDistance = Math.sqrt(5 * Math.pow(100, 2)); // ~223.6068

    for (const archetype of CULTURAL_ARCHETYPES_CATALOG) {
      const distance = Math.sqrt(
        Math.pow(traits.openness - archetype.traits.openness, 2) +
          Math.pow(traits.conscientiousness - archetype.traits.conscientiousness, 2) +
          Math.pow(traits.extraversion - archetype.traits.extraversion, 2) +
          Math.pow(traits.agreeableness - archetype.traits.agreeableness, 2) +
          Math.pow(traits.neuroticism - archetype.traits.neuroticism, 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestArchetype = archetype;
        // Calcular porcentaje de afinidad proporcional
        highestAffinity = Math.round((1 - distance / maxTheoreticalDistance) * 1000) / 10;
      }
    }

    return {
      id: closestArchetype.id,
      name: closestArchetype.name,
      origin: closestArchetype.origin,
      type: closestArchetype.type,
      affinityPercentage: highestAffinity,
      sharedTraits: closestArchetype.sharedTraits,
      avatarUrl: closestArchetype.avatarUrl,
    };
  }

  /**
   * Recomienda una obra literaria sintonizada con el arquetipo elemental y el humor sonoro.
   * Consulta Open Library con fallback automático ante latencia o fallos de red.
   */
  async recommendBook(
    element: ElementalArchetype,
    _traits: OceanTraits,
  ): Promise<BookRecommendation> {
    const theme = ELEMENTAL_BOOK_THEMES[element];

    try {
      const response = await axios.get<{
        docs?: readonly {
          title?: string;
          author_name?: readonly string[];
          cover_i?: number;
          key?: string;
        }[];
      }>(`${this.openLibraryBaseUrl}/search.json`, {
        params: {
          q: theme.searchSubject,
          limit: 1,
        },
        timeout: 3000,
      });

      const firstDoc = response.data.docs?.[0];
      if (firstDoc?.title && firstDoc.author_name?.[0]) {
        const coverUrl = firstDoc.cover_i
          ? `https://covers.openlibrary.org/b/id/${firstDoc.cover_i}-L.jpg`
          : theme.fallbackCoverUrl;

        return {
          title: firstDoc.title,
          author: firstDoc.author_name[0],
          coverUrl,
          openLibraryKey: firstDoc.key ?? theme.fallbackKey,
          matchedMood: theme.matchedMood,
          connectionReason: theme.connectionReason,
        };
      }
    } catch (error) {
      this.logger.debug(
        `Open Library API no disponible o fuera de tiempo, aplicando literatura editorial curada para ${element}`,
        error instanceof Error ? error.message : error,
      );
    }

    return {
      title: theme.fallbackTitle,
      author: theme.fallbackAuthor,
      coverUrl: theme.fallbackCoverUrl,
      openLibraryKey: theme.fallbackKey,
      matchedMood: theme.matchedMood,
      connectionReason: theme.connectionReason,
    };
  }
}
