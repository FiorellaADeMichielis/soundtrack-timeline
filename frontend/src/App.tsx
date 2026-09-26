import type { FC } from 'react';
import { DEFAULT_ELEMENT_INSIGHTS, ElementalArchetype } from '@soundtrack-timeline/shared';

export const App: FC = () => {
  const defaultElement = DEFAULT_ELEMENT_INSIGHTS.fuego;
  const elements: ElementalArchetype[] = ['fuego', 'tierra', 'aire', 'agua'];

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-canvas) text-(--text-primary)">
      {/* Enlace de salto accesible para navegación por teclado (WCAG 2.1 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-(--accent-brand) focus:text-white focus:rounded focus:outline-none"
      >
        Saltar al contenido principal
      </a>

      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full bg-(--accent-brand) animate-pulse"
            aria-hidden="true"
          />
          <h1 className="text-xl font-bold tracking-tight">Soundtrack Timeline</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>v2.0.0-PROD</span>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <section className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Línea de Tiempo Sonora & Artefactos Editoriales
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/70">
            Plataforma analítica y reactiva de streaming musical. Análisis psicométrico OCEAN,
            clasificación elemental y síntesis gráfica a 300 DPI.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {elements.map((el) => {
              const item = DEFAULT_ELEMENT_INSIGHTS[el];
              return (
                <span
                  key={el}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: item.palette.bgSurface,
                    borderColor: item.palette.accentBrand,
                    color: item.palette.textPrimary,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.palette.accentBrand }}
                    aria-hidden="true"
                  />
                  {item.title}
                </span>
              );
            })}
          </div>
          <div className="pt-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-(--bg-surface) text-(--accent-brand) border border-(--accent-brand)/30">
              Elemento Activo: {defaultElement.title}
            </span>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-white/50">
        <p>
          Contenido musical provisto por cortesía de Spotify. Plataforma analítica independiente.
        </p>
      </footer>
    </div>
  );
};

export default App;
