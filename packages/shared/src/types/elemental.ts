export type ElementalArchetype = 'fuego' | 'tierra' | 'aire' | 'agua';

export type ElementIconName = 'flame' | 'mountain' | 'wind' | 'droplet';

export interface ElementPalette {
  readonly bgCanvas: string;
  readonly bgSurface: string;
  readonly accentBrand: string;
  readonly textPrimary: string;
  readonly glowColor: string;
}

export interface ElementInsight {
  readonly primaryElement: ElementalArchetype;
  readonly dominancePercentage: number;
  readonly title: string;
  readonly poeticDescription: string;
  readonly iconName: ElementIconName;
  readonly palette: ElementPalette;
}
