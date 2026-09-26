import { create } from 'zustand';
import {
  AuthStatus,
  DemoProfileId,
  ElementalArchetype,
  ELEMENT_PALETTES,
  ElementPalette,
} from '@soundtrack-timeline/shared';
import { DEMO_PROFILES, DemoProfileData } from '../fixtures/demo-profiles';

export interface AppState {
  readonly authStatus: AuthStatus;
  readonly activeProfileId: DemoProfileId;
  readonly activeProfileData: DemoProfileData;
  readonly activeElement: ElementalArchetype;
  readonly activePalette: ElementPalette;

  // Acciones de mutación de estado
  readonly setDemoProfile: (profileId: DemoProfileId) => void;
  readonly setElement: (element: ElementalArchetype) => void;
  readonly setAuthStatus: (status: AuthStatus) => void;
  readonly resetToDemo: () => void;
}

const DEFAULT_PROFILE_ID: DemoProfileId = 'post-punk';
const initialProfile = DEMO_PROFILES[DEFAULT_PROFILE_ID];
const initialElement = initialProfile.summary.element.primaryElement;

export const useAppStore = create<AppState>()((set) => ({
  authStatus: {
    isAuthenticated: false,
    isDemo: true,
    demoProfileId: DEFAULT_PROFILE_ID,
  },
  activeProfileId: DEFAULT_PROFILE_ID,
  activeProfileData: initialProfile,
  activeElement: initialElement,
  activePalette: ELEMENT_PALETTES[initialElement],

  setDemoProfile: (profileId: DemoProfileId) => {
    const profile = DEMO_PROFILES[profileId];
    if (!profile) {
      return;
    }
    const element = profile.summary.element.primaryElement;
    set({
      activeProfileId: profileId,
      activeProfileData: profile,
      activeElement: element,
      activePalette: ELEMENT_PALETTES[element],
      authStatus: {
        isAuthenticated: false,
        isDemo: true,
        demoProfileId: profileId,
      },
    });
  },

  setElement: (element: ElementalArchetype) => {
    set({
      activeElement: element,
      activePalette: ELEMENT_PALETTES[element],
    });
  },

  setAuthStatus: (status: AuthStatus) => {
    set({ authStatus: status });
  },

  resetToDemo: () => {
    set({
      authStatus: {
        isAuthenticated: false,
        isDemo: true,
        demoProfileId: DEFAULT_PROFILE_ID,
      },
      activeProfileId: DEFAULT_PROFILE_ID,
      activeProfileData: initialProfile,
      activeElement: initialElement,
      activePalette: ELEMENT_PALETTES[initialElement],
    });
  },
}));
