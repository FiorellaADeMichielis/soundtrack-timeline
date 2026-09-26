import { OceanTraits, RankedArtist, Track } from '@soundtrack-timeline/shared';

// Diccionario de afinidad de palabras clave de géneros a dimensiones OCEAN
interface GenreWeight {
  readonly openness: number;
  readonly conscientiousness: number;
  readonly extraversion: number;
  readonly agreeableness: number;
  readonly neuroticism: number;
}

const GENRE_KEYWORD_WEIGHTS: Record<string, Partial<GenreWeight>> = {
  // Post-punk, Dark Wave, Goth, Emo
  'post-punk': { openness: 15, neuroticism: 30, extraversion: -10 },
  goth: { openness: 15, neuroticism: 30, extraversion: -15 },
  'dark wave': { openness: 20, neuroticism: 25, extraversion: -10 },
  emo: { neuroticism: 35, agreeableness: 5 },
  shoegaze: { openness: 25, neuroticism: 20, extraversion: -15 },
  grunge: { neuroticism: 25, openness: 10, conscientiousness: -10 },

  // Rock, Metal, Punk
  rock: { extraversion: 15, openness: 10 },
  metal: { neuroticism: 20, extraversion: 10, conscientiousness: 15 },
  punk: { extraversion: 20, conscientiousness: -20, openness: 15 },
  alternative: { openness: 15, agreeableness: 5 },
  indie: { openness: 20, agreeableness: 10 },

  // Synthwave, Electronic, Dance
  synthwave: { openness: 20, extraversion: 15, neuroticism: 10 },
  electronic: { extraversion: 20, openness: 15 },
  techno: { extraversion: 25, conscientiousness: 15 },
  house: { extraversion: 25, agreeableness: 10 },
  dance: { extraversion: 30, agreeableness: 5 },
  ambient: { openness: 25, extraversion: -25, agreeableness: 15, neuroticism: -10 },

  // Folk, Acoustic, Soul
  folk: { agreeableness: 25, openness: 15, extraversion: -10 },
  acoustic: { agreeableness: 25, neuroticism: -10 },
  soul: { agreeableness: 20, extraversion: 15 },
  jazz: { openness: 30, conscientiousness: 15 },
  classical: { openness: 25, conscientiousness: 25, extraversion: -20 },
  blues: { agreeableness: 15, neuroticism: 15 },

  // Pop, Hip Hop, Urban
  pop: { extraversion: 25, agreeableness: 10, conscientiousness: 10, openness: -5 },
  'hip hop': { extraversion: 25, conscientiousness: 10 },
  rap: { extraversion: 25, conscientiousness: 10 },
  latin: { extraversion: 30, agreeableness: 15 },
};

/**
 * Infiere el perfil psicométrico OCEAN (Big Five) a partir de la síntesis musical
 * analizando diversidad de géneros, popularidad y consistencia sonora.
 */
export function calculateOceanTraits(
  tracks: readonly Track[],
  artists: readonly RankedArtist[],
): OceanTraits {
  // Puntos base neutrales (50/100)
  let openness = 50;
  let conscientiousness = 50;
  let extraversion = 50;
  let agreeableness = 50;
  let neuroticism = 50;

  if (tracks.length === 0 && artists.length === 0) {
    return {
      openness,
      conscientiousness,
      extraversion,
      agreeableness,
      neuroticism,
    };
  }

  // 1. Análisis de géneros musicales presentes en los artistas
  const allGenres = artists.flatMap((artist) => artist.genres.map((g) => g.toLowerCase()));
  const uniqueGenres = new Set(allGenres);

  // Bonificación de Openness por variedad genérica (hasta +25)
  openness += Math.min(25, uniqueGenres.size * 2);

  // Impacto de palabras clave de géneros en OCEAN
  let matchedKeywords = 0;
  for (const genre of allGenres) {
    for (const [keyword, weights] of Object.entries(GENRE_KEYWORD_WEIGHTS)) {
      if (genre.includes(keyword)) {
        openness += (weights.openness ?? 0) * 0.4;
        conscientiousness += (weights.conscientiousness ?? 0) * 0.4;
        extraversion += (weights.extraversion ?? 0) * 0.4;
        agreeableness += (weights.agreeableness ?? 0) * 0.4;
        neuroticism += (weights.neuroticism ?? 0) * 0.4;
        matchedKeywords++;
      }
    }
  }

  // Si hubo muchas coincidencias, amortiguar escala
  if (matchedKeywords > 0) {
    const damping = Math.min(1.5, matchedKeywords / 15);
    openness = 50 + (openness - 50) / damping;
    conscientiousness = 50 + (conscientiousness - 50) / damping;
    extraversion = 50 + (extraversion - 50) / damping;
    agreeableness = 50 + (agreeableness - 50) / damping;
    neuroticism = 50 + (neuroticism - 50) / damping;
  }

  // 2. Análisis de Popularidad promedio (correlacionado con Extraversión y Conforming)
  if (tracks.length > 0) {
    const avgPopularity = tracks.reduce((acc, t) => acc + t.popularity, 0) / tracks.length;
    // Popularidad alta eleva extraversión, popularidad baja (indie/obscuro) eleva openness
    if (avgPopularity > 60) {
      extraversion += (avgPopularity - 60) * 0.3;
    } else {
      openness += (60 - avgPopularity) * 0.25;
      neuroticism += (60 - avgPopularity) * 0.15;
    }

    // 3. Regularidad temporal (duración de canciones y consistencia -> Conscientiousness)
    const durations = tracks.map((t) => t.durationMs);
    const avgDuration = durations.reduce((acc, d) => acc + d, 0) / durations.length;
    const durationVariance =
      durations.reduce((acc, d) => acc + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const stdDevSeconds = Math.sqrt(durationVariance) / 1000;

    // Poca variabilidad en duración indica preferencia por esquemas formales regulares (+Conscientiousness)
    if (stdDevSeconds < 45) {
      conscientiousness += 12;
    } else if (stdDevSeconds > 90) {
      // Mucha variabilidad indica estructuras experimentales / progresivas (+Openness)
      openness += 10;
      conscientiousness -= 8;
    }
  }

  // Asegurar rango acotado [15, 95] con redondeo entero
  const clamp = (val: number): number => Math.min(95, Math.max(15, Math.round(val)));

  return {
    openness: clamp(openness),
    conscientiousness: clamp(conscientiousness),
    extraversion: clamp(extraversion),
    agreeableness: clamp(agreeableness),
    neuroticism: clamp(neuroticism),
  };
}
