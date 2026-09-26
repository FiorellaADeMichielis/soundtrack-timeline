import { useEffect } from 'react';
import { ElementalArchetype, ElementPalette } from '@soundtrack-timeline/shared';
import { useAppStore } from '../stores/useAppStore';

export interface UseDynamicThemeReturn {
  readonly activeElement: ElementalArchetype;
  readonly activePalette: ElementPalette;
}

export const useDynamicTheme = (): UseDynamicThemeReturn => {
  const activeElement = useAppStore((state) => state.activeElement);
  const activePalette = useAppStore((state) => state.activePalette);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty('--bg-canvas', activePalette.bgCanvas);
    root.style.setProperty('--bg-surface', activePalette.bgSurface);
    root.style.setProperty('--accent-brand', activePalette.accentBrand);
    root.style.setProperty('--text-primary', activePalette.textPrimary);
    root.style.setProperty('--glow-color', activePalette.glowColor);
    root.setAttribute('data-element', activeElement);
  }, [activeElement, activePalette]);

  return { activeElement, activePalette };
};
