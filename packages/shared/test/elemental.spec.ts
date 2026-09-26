import { describe, it, expect } from 'vitest';
import { ELEMENT_PALETTES, DEFAULT_ELEMENT_INSIGHTS } from '../src/constants/elemental.constants';
import { ElementalArchetype } from '../src/types/elemental';

// Función matemática de cálculo de luminancia relativa (WCAG 2.1)
function getRelativeLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const [rLinear, gLinear, bLinear] = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * (rLinear ?? 0) + 0.7152 * (gLinear ?? 0) + 0.0722 * (bLinear ?? 0);
}

function getContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lum1 = getRelativeLuminance(foregroundHex);
  const lum2 = getRelativeLuminance(backgroundHex);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Elemental Palettes & Contrast (WCAG 2.1 AA Compliance - RNF-011)', () => {
  const elements: ElementalArchetype[] = ['fuego', 'tierra', 'aire', 'agua'];

  elements.forEach((element) => {
    describe('Paleta elemental: ' + element, () => {
      const palette = ELEMENT_PALETTES[element];

      it('garantiza ratio de contraste >= 4.5:1 entre textPrimary y bgCanvas', () => {
        const ratio = getContrastRatio(palette.textPrimary, palette.bgCanvas);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('garantiza ratio de contraste >= 4.5:1 entre textPrimary y bgSurface', () => {
        const ratio = getContrastRatio(palette.textPrimary, palette.bgSurface);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });

      it('contiene insight predeterminado coherente', () => {
        const insight = DEFAULT_ELEMENT_INSIGHTS[element];
        expect(insight.primaryElement).toBe(element);
        expect(insight.title.length).toBeGreaterThan(5);
        expect(insight.poeticDescription.length).toBeGreaterThan(10);
      });
    });
  });
});
