import { ElementalArchetype, ElementPalette, ElementInsight } from '../types/elemental';

export const ELEMENT_PALETTES: Record<ElementalArchetype, ElementPalette> = {
  fuego: {
    bgCanvas: '#120907',
    bgSurface: '#23120E',
    accentBrand: '#FF4500',
    textPrimary: '#FFF5F2',
    glowColor: 'rgba(255, 69, 0, 0.4)',
  },
  tierra: {
    bgCanvas: '#0E120A',
    bgSurface: '#1A2214',
    accentBrand: '#70A647',
    textPrimary: '#F4F8EE',
    glowColor: 'rgba(112, 166, 71, 0.4)',
  },
  aire: {
    bgCanvas: '#081018',
    bgSurface: '#102030',
    accentBrand: '#00D2FF',
    textPrimary: '#F0F9FF',
    glowColor: 'rgba(0, 210, 255, 0.4)',
  },
  agua: {
    bgCanvas: '#060D1A',
    bgSurface: '#0D1B36',
    accentBrand: '#3B82F6',
    textPrimary: '#EFF6FF',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
} as const;

export const DEFAULT_ELEMENT_INSIGHTS: Record<ElementalArchetype, ElementInsight> = {
  fuego: {
    primaryElement: 'fuego',
    dominancePercentage: 62.4,
    title: 'Núcleo de Fuego (Catarsis y Distorsión)',
    poeticDescription:
      'Tu atmósfera sonora vibra con altos decibelios, tempos acelerados y una energía indómita.',
    iconName: 'flame',
    palette: ELEMENT_PALETTES.fuego,
  },
  tierra: {
    primaryElement: 'tierra',
    dominancePercentage: 58.1,
    title: 'Raíz de Tierra (Textura Orgánica y Compás)',
    poeticDescription:
      'Tu escucha se afianza en armonías de madera, percusión terrenal y cadencias profundas.',
    iconName: 'mountain',
    palette: ELEMENT_PALETTES.tierra,
  },
  aire: {
    primaryElement: 'aire',
    dominancePercentage: 65.7,
    title: 'Pulso de Aire (Sintetizadores y Espacio)',
    poeticDescription:
      'Vuelas entre texturas etéreas, arpegios cósmicos y frecuencias que trascienden el suelo.',
    iconName: 'wind',
    palette: ELEMENT_PALETTES.aire,
  },
  agua: {
    primaryElement: 'agua',
    dominancePercentage: 61.2,
    title: 'Marea de Agua (Melancolía y Fluidez)',
    poeticDescription:
      'Sonoridades envolventes, ecos submarinos y mareas de introspección guían tu viaje.',
    iconName: 'droplet',
    palette: ELEMENT_PALETTES.agua,
  },
} as const;
