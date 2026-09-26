import {
  DEFAULT_ELEMENT_INSIGHTS,
  ElementalArchetype,
  ElementInsight,
  OceanTraits,
  RankedArtist,
} from '@soundtrack-timeline/shared';

const ELEMENT_GENRE_AFFINITIES: Record<ElementalArchetype, readonly string[]> = {
  fuego: ['post-punk', 'punk', 'metal', 'industrial', 'rock', 'dark wave', 'grunge', 'hardcore'],
  tierra: ['folk', 'blues', 'acoustic', 'roots', 'country', 'soul', 'jazz', 'americana'],
  aire: [
    'synthwave',
    'electronic',
    'techno',
    'house',
    'progressive',
    'ambient',
    'art pop',
    'psychedelic',
    'cyberpunk',
  ],
  agua: [
    'dream pop',
    'shoegaze',
    'indie folk',
    'lo-fi',
    'classical',
    'ballad',
    'emo',
    'chamber pop',
    'sadcore',
  ],
};

/**
 * Deduce el arquetipo elemental y su porcentaje de dominancia a partir del vector OCEAN
 * y la distribución de géneros musicales de los artistas más escuchados.
 */
export function classifyElementalArchetype(
  traits: OceanTraits,
  artists: readonly RankedArtist[] = [],
): ElementInsight {
  // 1. Puntuación psicométrica base
  let fuegoScore =
    traits.neuroticism * 0.45 + traits.extraversion * 0.35 + (100 - traits.agreeableness) * 0.2;
  let tierraScore =
    traits.conscientiousness * 0.5 + traits.agreeableness * 0.3 + (100 - traits.neuroticism) * 0.2;
  let aireScore =
    traits.openness * 0.55 + traits.extraversion * 0.25 + (100 - traits.conscientiousness) * 0.2;
  let aguaScore = traits.openness * 0.35 + traits.agreeableness * 0.35 + traits.neuroticism * 0.3;

  // 2. Moduladores por géneros reales de los artistas
  const allGenres = artists.flatMap((artist) => artist.genres.map((g) => g.toLowerCase()));

  for (const genre of allGenres) {
    for (const [element, keywords] of Object.entries(ELEMENT_GENRE_AFFINITIES)) {
      if (keywords.some((keyword) => genre.includes(keyword))) {
        if (element === 'fuego') fuegoScore += 4;
        if (element === 'tierra') tierraScore += 4;
        if (element === 'aire') aireScore += 4;
        if (element === 'agua') aguaScore += 4;
      }
    }
  }

  // 3. Determinar elemento ganador
  const elementScores: { readonly element: ElementalArchetype; readonly score: number }[] = [
    { element: 'fuego', score: fuegoScore },
    { element: 'tierra', score: tierraScore },
    { element: 'aire', score: aireScore },
    { element: 'agua', score: aguaScore },
  ];

  elementScores.sort((a, b) => b.score - a.score);
  const winner = elementScores[0];
  const totalScore = elementScores.reduce((sum, item) => sum + item.score, 0);

  // Calcular dominancia porcentual proporcional en rango [68%, 95%]
  const rawDominance = (winner.score / (totalScore || 1)) * 100;
  const dominancePercentage = Math.min(95, Math.max(68, Math.round(45 + rawDominance * 1.1)));

  const baseInsight = DEFAULT_ELEMENT_INSIGHTS[winner.element];

  return {
    ...baseInsight,
    dominancePercentage,
  };
}
