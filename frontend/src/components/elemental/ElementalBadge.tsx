import type { FC, CSSProperties } from 'react';
import { Droplet, Flame, Mountain, Wind } from 'lucide-react';
import { ElementalArchetype, ELEMENT_PALETTES } from '@soundtrack-timeline/shared';

export interface ElementalBadgeProps {
  readonly element: ElementalArchetype;
  readonly dominancePercentage?: number;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const ELEMENT_LABELS: Record<ElementalArchetype, string> = {
  fuego: 'Fuego',
  tierra: 'Tierra',
  aire: 'Aire',
  agua: 'Agua',
};

const ELEMENT_ICONS: Record<
  ElementalArchetype,
  FC<{ className?: string; style?: CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>
> = {
  fuego: Flame,
  tierra: Mountain,
  aire: Wind,
  agua: Droplet,
};

export const ElementalBadge: FC<ElementalBadgeProps> = ({
  element,
  dominancePercentage,
  size = 'md',
  className = '',
}) => {
  const palette = ELEMENT_PALETTES[element];
  const Icon = ELEMENT_ICONS[element];
  const label = ELEMENT_LABELS[element];

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3.5 py-1 gap-2',
    lg: 'text-base px-4 py-1.5 gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span
      data-testid={`element-badge-${element}`}
      className={`inline-flex items-center rounded-full font-medium border transition-colors duration-300 ${sizeStyles} ${className}`}
      style={{
        backgroundColor: palette.bgSurface,
        borderColor: `${palette.accentBrand}80`,
        color: palette.textPrimary,
        boxShadow: `0 0 12px ${palette.glowColor}`,
      }}
    >
      <Icon
        className={`${iconSizes} shrink-0 animate-pulse`}
        style={{ color: palette.accentBrand }}
        aria-hidden="true"
      />
      <span className="tracking-wide">Arquetipo {label}</span>
      {dominancePercentage !== undefined && (
        <span
          className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: `${palette.accentBrand}33`,
            color: palette.accentBrand,
          }}
        >
          {dominancePercentage.toFixed(1)}%
        </span>
      )}
    </span>
  );
};
