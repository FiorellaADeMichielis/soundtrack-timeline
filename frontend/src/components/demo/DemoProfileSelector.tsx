import type { FC } from 'react';
import { DemoProfileId } from '@soundtrack-timeline/shared';
import { DEMO_PROFILES } from '../../fixtures/demo-profiles';
import { useAppStore } from '../../stores/useAppStore';

const PROFILE_IDS: readonly DemoProfileId[] = ['post-punk', 'synthwave', 'indie-folk'];

export const DemoProfileSelector: FC = () => {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const setDemoProfile = useAppStore((state) => state.setDemoProfile);

  return (
    <nav
      aria-label="Selector de perfiles de demostración"
      className="w-full max-w-5xl mx-auto my-6 px-4"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-(--accent-brand) animate-ping" />
          <h2
            id="demo-nav-title"
            className="text-sm font-semibold tracking-wider uppercase text-white/80"
          >
            Perfiles de Demostración Sintéticos
          </h2>
        </div>
        <p className="text-xs text-white/50">
          Datos puros en memoria • Sin conexión a Spotify requerida
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="demo-nav-title"
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4"
      >
        {PROFILE_IDS.map((profileId) => {
          const profile = DEMO_PROFILES[profileId];
          const isActive = activeProfileId === profileId;
          const element = profile.summary.element.primaryElement;

          return (
            <button
              key={profileId}
              type="button"
              aria-pressed={isActive}
              onClick={() => setDemoProfile(profileId)}
              className={`flex flex-col text-left p-3.5 rounded-lg border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-canvas) ${
                isActive
                  ? 'border-(--accent-brand) bg-(--bg-surface) shadow-lg shadow-(--glow-color)'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-(--accent-brand)/20 text-(--accent-brand)'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  {profile.badgeLabel}
                </span>
                {isActive && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-(--accent-brand)">
                    Activo
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-(--text-primary) mt-1">{profile.name}</h3>
              <p className="text-xs text-white/60 line-clamp-2 mt-1">{profile.subtitle}</p>
              <div className="mt-2 text-[11px] text-white/40 flex items-center gap-1.5">
                <span>Dominancia {element}:</span>
                <span className="font-semibold text-white/70">
                  {profile.summary.element.dominancePercentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
