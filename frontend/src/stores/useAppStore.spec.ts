import { beforeEach, describe, expect, it } from 'vitest';
import { ELEMENT_PALETTES } from '@soundtrack-timeline/shared';
import { useAppStore } from './useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDemo();
  });

  it('inicializa con el perfil demo por defecto (post-punk / fuego)', () => {
    const state = useAppStore.getState();

    expect(state.activeProfileId).toBe('post-punk');
    expect(state.activeElement).toBe('fuego');
    expect(state.activePalette).toEqual(ELEMENT_PALETTES.fuego);
    expect(state.activeProfileData.name).toBe('Post-Punk & Dark Wave');
    expect(state.authStatus.isDemo).toBe(true);
    expect(state.authStatus.demoProfileId).toBe('post-punk');
  });

  it('permite cambiar a otro perfil demo (synthwave / aire) actualizando arquetipo y paleta', () => {
    useAppStore.getState().setDemoProfile('synthwave');

    const state = useAppStore.getState();
    expect(state.activeProfileId).toBe('synthwave');
    expect(state.activeElement).toBe('aire');
    expect(state.activePalette).toEqual(ELEMENT_PALETTES.aire);
    expect(state.activeProfileData.name).toBe('Synthwave & Cyberpunk');
    expect(state.authStatus.demoProfileId).toBe('synthwave');
  });

  it('permite cambiar a indie-folk (tierra) con su correspondiente configuración', () => {
    useAppStore.getState().setDemoProfile('indie-folk');

    const state = useAppStore.getState();
    expect(state.activeProfileId).toBe('indie-folk');
    expect(state.activeElement).toBe('tierra');
    expect(state.activePalette).toEqual(ELEMENT_PALETTES.tierra);
    expect(state.activeProfileData.name).toBe('Indie Folk & Acústica Orgánica');
  });

  it('permite modificar directamente el arquetipo elemental activo', () => {
    useAppStore.getState().setElement('agua');

    const state = useAppStore.getState();
    expect(state.activeElement).toBe('agua');
    expect(state.activePalette).toEqual(ELEMENT_PALETTES.agua);
  });

  it('restablece el estado completo a los valores iniciales con resetToDemo', () => {
    useAppStore.getState().setDemoProfile('synthwave');
    useAppStore.getState().resetToDemo();

    const state = useAppStore.getState();
    expect(state.activeProfileId).toBe('post-punk');
    expect(state.activeElement).toBe('fuego');
    expect(state.activePalette).toEqual(ELEMENT_PALETTES.fuego);
  });

  it('actualiza el estado de autenticación correctamente', () => {
    useAppStore.getState().setAuthStatus({
      isAuthenticated: true,
      isDemo: false,
      userId: 'usr_spotify_123',
      displayName: 'Alex Turner',
    });

    const state = useAppStore.getState();
    expect(state.authStatus.isAuthenticated).toBe(true);
    expect(state.authStatus.isDemo).toBe(false);
    expect(state.authStatus.userId).toBe('usr_spotify_123');
  });
});
