import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect } from 'vitest';
import { useAppStore } from './stores/useAppStore';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    useAppStore.getState().resetToDemo();
  });

  it('renderiza el título principal y la atribución reglamentaria de Spotify', () => {
    render(<App />);

    const mainHeading = screen.getByRole('heading', { level: 1, name: /soundtrack timeline/i });
    expect(mainHeading).toBeInTheDocument();

    const spotifyAttribution = screen.getByText(
      /contenido musical provisto por cortesía de spotify/i,
    );
    expect(spotifyAttribution).toBeInTheDocument();
  });

  it('proporciona un enlace de salto de accesibilidad (skip link)', () => {
    render(<App />);

    const skipLink = screen.getByRole('link', { name: /saltar al contenido principal/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renderiza los cuatro arquetipos elementales del dominio compartido', () => {
    render(<App />);

    const fuegoElements = screen.getAllByText(/núcleo de fuego/i);
    expect(fuegoElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/raíz de tierra/i)).toBeInTheDocument();
    expect(screen.getByText(/pulso de aire/i)).toBeInTheDocument();
    expect(screen.getByText(/marea de agua/i)).toBeInTheDocument();
  });

  it('renderiza el selector de perfiles y permite alternar entre perfiles sintéticos', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 2, name: /post-punk & dark wave/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/perfil psicométrico ocean/i)).toBeInTheDocument();
    expect(screen.getByText(/fahrenheit 451/i)).toBeInTheDocument();

    // Cambiar a Synthwave
    const synthwaveButton = screen.getByRole('button', { name: /synthwave & cyberpunk/i });
    fireEvent.click(synthwaveButton);

    expect(
      screen.getByRole('heading', { level: 2, name: /synthwave & cyberpunk/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/neuromancer/i)).toBeInTheDocument();
  });

  it('renderiza la cláusula de privacidad en cumplimiento con la Ley 25.326', () => {
    render(<App />);

    expect(
      screen.getByText(/cumplimiento de privacidad: modo de datos en tránsito/i),
    ).toBeInTheDocument();
  });
});
