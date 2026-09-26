import type { FC } from 'react';
import {
  DEFAULT_ELEMENT_INSIGHTS,
  ElementalArchetype,
  OceanTraits,
} from '@soundtrack-timeline/shared';
import { DemoProfileSelector } from './components/demo/DemoProfileSelector';
import { ElementalBadge } from './components/elemental/ElementalBadge';
import { useDynamicTheme } from './hooks/useDynamicTheme';
import { useAppStore } from './stores/useAppStore';

const ALL_ELEMENTS: readonly ElementalArchetype[] = ['fuego', 'tierra', 'aire', 'agua'];

const OCEAN_METRICS: readonly {
  readonly key: keyof OceanTraits;
  readonly label: string;
  readonly description: string;
}[] = [
  { key: 'openness', label: 'Apertura', description: 'Curiosidad estética y novedad' },
  {
    key: 'conscientiousness',
    label: 'Responsabilidad',
    description: 'Estructura rítmica y cadencia',
  },
  { key: 'extraversion', label: 'Extraversión', description: 'Intensidad social y energía' },
  { key: 'agreeableness', label: 'Amabilidad', description: 'Calidez acústica y armonía' },
  { key: 'neuroticism', label: 'Sensibilidad', description: 'Profundidad emocional y tensión' },
];

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const App: FC = () => {
  const { activeElement } = useDynamicTheme();
  const activeProfileData = useAppStore((state) => state.activeProfileData);
  const setElement = useAppStore((state) => state.setElement);

  const { summary, topArtists, topTracks } = activeProfileData;
  const { element, psychometrics, book, character } = summary;

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-canvas) text-(--text-primary) transition-colors duration-500">
      {/* Enlace de salto accesible para navegación por teclado (WCAG 2.1 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-(--accent-brand) focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
      >
        Saltar al contenido principal
      </a>

      {/* Barra de cabecera principal */}
      <header className="border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-(--bg-surface)/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span
            className="w-3.5 h-3.5 rounded-full bg-(--accent-brand) shadow-md animate-pulse"
            style={{ boxShadow: '0 0 10px var(--glow-color)' }}
            aria-hidden="true"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Soundtrack Timeline</h1>
            <p className="text-[11px] text-white/50 tracking-wider uppercase">
              Plataforma Editorial de Analítica Musical
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ElementalBadge
            element={activeElement}
            dominancePercentage={element.dominancePercentage}
            size="sm"
          />
          <span className="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70 font-mono">
            v2.0.0-PROD
          </span>
        </div>
      </header>

      {/* Selector de perfiles de demostración */}
      <DemoProfileSelector />

      {/* Contenido principal analítico */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 outline-none"
      >
        {/* Cabecera del perfil activo */}
        <section
          aria-labelledby="profile-overview-heading"
          className="p-8 rounded-2xl border border-white/10 bg-(--bg-surface)/60 backdrop-blur-sm relative overflow-hidden mb-8"
        >
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl -mr-20 -mt-20"
            style={{ backgroundColor: 'var(--accent-brand)' }}
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-white/80">
                {activeProfileData.badgeLabel}
              </span>
              <ElementalBadge
                element={element.primaryElement}
                dominancePercentage={element.dominancePercentage}
                size="md"
              />
            </div>

            <h2
              id="profile-overview-heading"
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2"
            >
              {activeProfileData.name}
            </h2>
            <p className="text-lg text-white/80 max-w-3xl mb-6">{activeProfileData.subtitle}</p>

            <div className="p-4 rounded-xl border border-white/10 bg-black/20 max-w-3xl">
              <h3 className="text-xs uppercase font-bold tracking-wider text-(--accent-brand) mb-1">
                {element.title}
              </h3>
              <p className="text-sm text-white/90 leading-relaxed italic">
                &ldquo;{element.poeticDescription}&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* Rejilla de métricas analíticas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Panel 1: Vector Psicométrico OCEAN */}
          <section
            aria-labelledby="ocean-heading"
            className="p-6 rounded-xl border border-white/10 bg-(--bg-surface)/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  id="ocean-heading"
                  className="text-base font-bold text-white flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-(--accent-brand)" aria-hidden="true" />
                  Perfil Psicométrico OCEAN
                </h3>
                <span className="text-[11px] text-white/50">Big Five</span>
              </div>
              <p className="text-xs text-white/60 mb-6">
                Inferencia comportamental derivada de dinámica acústica, valencia y complejidad
                estructural.
              </p>

              <div className="space-y-4">
                {OCEAN_METRICS.map(({ key, label, description }) => {
                  const value = psychometrics[key];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-white/90">{label}</span>
                        <span className="font-mono text-white/70">{value}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`Métrica ${label}`}
                        aria-valuenow={value}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="w-full h-2 rounded-full bg-white/10 overflow-hidden"
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${value}%`,
                            backgroundColor: 'var(--accent-brand)',
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-white/40 mt-0.5">{description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Panel 2: Conexión Cultural & Arquetipos */}
          <section
            aria-labelledby="cultural-heading"
            className="p-6 rounded-xl border border-white/10 bg-(--bg-surface)/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  id="cultural-heading"
                  className="text-base font-bold text-white flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-(--accent-brand)" aria-hidden="true" />
                  Afinidad Cultural & Literatura
                </h3>
                <span className="text-[11px] text-white/50">Open Library</span>
              </div>
              <p className="text-xs text-white/60 mb-5">
                Vínculo semántico entre densidad sonora, tonalidad lírica y narrativa editorial.
              </p>

              {/* Libro recomendado */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
                <div className="text-[11px] uppercase tracking-wider text-(--accent-brand) font-bold mb-1">
                  Lectura Sintonizada ({book.matchedMood})
                </div>
                <div className="text-sm font-bold text-white">{book.title}</div>
                <div className="text-xs text-white/70 mb-2">{book.author}</div>
                <p className="text-xs text-white/60 italic">
                  &ldquo;{book.connectionReason}&rdquo;
                </p>
              </div>

              {/* Personaje cultural */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold">
                    Arquetipo Cultural
                  </span>
                  <span className="text-xs font-mono font-bold text-(--accent-brand)">
                    {character.affinityPercentage}% afinidad
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{character.name}</div>
                <div className="text-xs text-white/70 mb-2">Origen: {character.origin}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {character.sharedTraits.map((trait) => (
                    <span
                      key={trait}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Panel 3: Síntesis Musical (Top Artistas & Pistas) */}
          <section
            aria-labelledby="tracks-heading"
            className="p-6 rounded-xl border border-white/10 bg-(--bg-surface)/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  id="tracks-heading"
                  className="text-base font-bold text-white flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-(--accent-brand)" aria-hidden="true" />
                  Top Sonoro Inmediato
                </h3>
                <span className="text-[11px] text-white/50">Métricas</span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-white/60 mb-2">
                    Artistas Clave
                  </h4>
                  <ul className="space-y-2" aria-label="Artistas destacados">
                    {topArtists.slice(0, 3).map((artist, idx) => (
                      <li
                        key={artist.id}
                        className="flex items-center justify-between p-2 rounded bg-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-white">{artist.name}</span>
                        </div>
                        <span className="text-white/50 text-[11px]">{artist.genres[0]}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs uppercase font-bold tracking-wider text-white/60 mb-2">
                    Canciones Determinantes
                  </h4>
                  <ul className="space-y-2" aria-label="Canciones determinantes">
                    {topTracks.slice(0, 3).map((track, idx) => (
                      <li
                        key={track.id}
                        className="flex items-center justify-between p-2 rounded bg-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="w-5 h-5 shrink-0 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="font-semibold text-white truncate block">
                              {track.title}
                            </span>
                            <span className="text-white/50 text-[10px] block">
                              {track.artistNames.join(', ')}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-white/50 text-[11px] shrink-0">
                          {formatDuration(track.durationMs)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Explorador de Arquetipos Elementales del Dominio */}
        <section
          aria-labelledby="elemental-catalog-heading"
          className="p-6 rounded-xl border border-white/10 bg-(--bg-surface)/20 text-center"
        >
          <h3
            id="elemental-catalog-heading"
            className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2"
          >
            Catálogo de Arquetipos Elementales
          </h3>
          <p className="text-xs text-white/50 max-w-xl mx-auto mb-4">
            Cada perfil musical sintoniza con una frecuencia elemental de resonancia. Haz clic para
            previsualizar una paleta alternativa.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {ALL_ELEMENTS.map((el) => {
              const item = DEFAULT_ELEMENT_INSIGHTS[el];
              const isCurrent = activeElement === el;

              return (
                <button
                  key={el}
                  type="button"
                  onClick={() => setElement(el)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isCurrent ? 'ring-2 ring-white scale-105' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: item.palette.bgSurface,
                    borderColor: item.palette.accentBrand,
                    color: item.palette.textPrimary,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.palette.accentBrand }}
                    aria-hidden="true"
                  />
                  <span>{item.title}</span>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Pie de página normativo */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/50 space-y-2">
        <p>
          Contenido musical provisto por cortesía de Spotify. Plataforma analítica independiente.
        </p>
        <p className="text-[11px] text-white/40">
          Cumplimiento de privacidad: Modo de datos en tránsito sin persistencia según Ley 25.326.
        </p>
      </footer>
    </div>
  );
};

export default App;
