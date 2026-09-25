import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renderiza el título principal y la atribución reglamentaria de Spotify', () => {
    render(<App />);

    const mainHeading = screen.getByRole('heading', {
      level: 1,
      name: /soundtrack timeline/i,
    });
    expect(mainHeading).toBeInTheDocument();

    const spotifyAttribution = screen.getByText(
      /contenido musical provisto por cortesía de spotify/i,
    );
    expect(spotifyAttribution).toBeInTheDocument();
  });

  it('proporciona un enlace de salto de accesibilidad (skip link)', () => {
    render(<App />);

    const skipLink = screen.getByRole('link', {
      name: /saltar al contenido principal/i,
    });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});
