import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ELEMENT_PALETTES } from '@soundtrack-timeline/shared';
import { useAppStore } from '../stores/useAppStore';
import { useDynamicTheme } from './useDynamicTheme';

describe('useDynamicTheme', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDemo();
  });

  it('inyecta las variables CSS del arquetipo fuego en documentElement por defecto', () => {
    const { result } = renderHook(() => useDynamicTheme());

    expect(result.current.activeElement).toBe('fuego');
    expect(result.current.activePalette).toEqual(ELEMENT_PALETTES.fuego);

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--bg-canvas')).toBe(ELEMENT_PALETTES.fuego.bgCanvas);
    expect(root.style.getPropertyValue('--bg-surface')).toBe(ELEMENT_PALETTES.fuego.bgSurface);
    expect(root.style.getPropertyValue('--accent-brand')).toBe(ELEMENT_PALETTES.fuego.accentBrand);
    expect(root.style.getPropertyValue('--text-primary')).toBe(ELEMENT_PALETTES.fuego.textPrimary);
    expect(root.style.getPropertyValue('--glow-color')).toBe(ELEMENT_PALETTES.fuego.glowColor);
    expect(root.getAttribute('data-element')).toBe('fuego');
  });

  it('actualiza dinámicamente las variables CSS al cambiar de perfil a synthwave (aire)', () => {
    const { result } = renderHook(() => useDynamicTheme());

    act(() => {
      useAppStore.getState().setDemoProfile('synthwave');
    });

    expect(result.current.activeElement).toBe('aire');
    expect(result.current.activePalette).toEqual(ELEMENT_PALETTES.aire);

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--bg-canvas')).toBe(ELEMENT_PALETTES.aire.bgCanvas);
    expect(root.style.getPropertyValue('--bg-surface')).toBe(ELEMENT_PALETTES.aire.bgSurface);
    expect(root.style.getPropertyValue('--accent-brand')).toBe(ELEMENT_PALETTES.aire.accentBrand);
    expect(root.style.getPropertyValue('--text-primary')).toBe(ELEMENT_PALETTES.aire.textPrimary);
    expect(root.style.getPropertyValue('--glow-color')).toBe(ELEMENT_PALETTES.aire.glowColor);
    expect(root.getAttribute('data-element')).toBe('aire');
  });

  it('actualiza dinámicamente las variables CSS al cambiar a indie-folk (tierra)', () => {
    const { result } = renderHook(() => useDynamicTheme());

    act(() => {
      useAppStore.getState().setDemoProfile('indie-folk');
    });

    expect(result.current.activeElement).toBe('tierra');
    expect(result.current.activePalette).toEqual(ELEMENT_PALETTES.tierra);

    const root = document.documentElement;
    expect(root.style.getPropertyValue('--bg-canvas')).toBe(ELEMENT_PALETTES.tierra.bgCanvas);
    expect(root.getAttribute('data-element')).toBe('tierra');
  });
});
