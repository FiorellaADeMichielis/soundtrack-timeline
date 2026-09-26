import { render, screen, fireEvent, act } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { authApi } from './services/authApi';
import { useAppStore } from './stores/useAppStore';
import App from './App';

vi.mock('./services/authApi', () => ({
  authApi: {
    getLoginUrl: vi.fn(() => 'http://localhost:4000/api/auth/login'),
    fetchAuthStatus: vi.fn().mockResolvedValue({
      isAuthenticated: false,
      isDemo: true,
      demoProfileId: 'post-punk',
    }),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.getState().resetToDemo();
  });

  const renderApp = async () => {
    await act(async () => {
      render(<App />);
    });
  };

  it('renderiza el título principal y la atribución reglamentaria de Spotify', async () => {
    await renderApp();

    const mainHeading = screen.getByRole('heading', { level: 1, name: /soundtrack timeline/i });
    expect(mainHeading).toBeInTheDocument();

    const spotifyAttribution = screen.getByText(
      /contenido musical provisto por cortesía de spotify/i,
    );
    expect(spotifyAttribution).toBeInTheDocument();
  });

  it('proporciona un enlace de salto de accesibilidad (skip link)', async () => {
    await renderApp();

    const skipLink = screen.getByRole('link', { name: /saltar al contenido principal/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renderiza el botón para conectar con Spotify en modo demo', async () => {
    await renderApp();

    const loginButton = screen.getByRole('link', { name: /conectar con spotify/i });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('href', 'http://localhost:4000/api/auth/login');
  });

  it('renderiza los controles de usuario autenticado cuando la sesión está activa', async () => {
    vi.mocked(authApi.fetchAuthStatus).mockResolvedValueOnce({
      isAuthenticated: true,
      isDemo: false,
      userId: 'usr_spotify_1',
      displayName: 'Gustavo Cerati',
    });

    useAppStore.getState().setAuthStatus({
      isAuthenticated: true,
      isDemo: false,
      userId: 'usr_spotify_1',
      displayName: 'Gustavo Cerati',
    });

    await renderApp();

    expect(screen.getByText('Gustavo Cerati')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cerrar sesión de spotify/i })).toBeInTheDocument();
    expect(screen.getByText(/spotify conectado/i)).toBeInTheDocument();
  });

  it('renderiza los cuatro arquetipos elementales del dominio compartido', async () => {
    await renderApp();

    const fuegoElements = screen.getAllByText(/núcleo de fuego/i);
    expect(fuegoElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/raíz de tierra/i)).toBeInTheDocument();
    expect(screen.getByText(/pulso de aire/i)).toBeInTheDocument();
    expect(screen.getByText(/marea de agua/i)).toBeInTheDocument();
  });

  it('renderiza el selector de perfiles y permite alternar entre perfiles sintéticos', async () => {
    await renderApp();

    expect(
      screen.getByRole('heading', { level: 2, name: /post-punk & dark wave/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/perfil psicométrico ocean/i)).toBeInTheDocument();
    expect(screen.getByText(/fahrenheit 451/i)).toBeInTheDocument();

    // Cambiar a Synthwave
    const synthwaveButton = screen.getByRole('button', { name: /synthwave & cyberpunk/i });
    await act(async () => {
      fireEvent.click(synthwaveButton);
    });

    expect(
      screen.getByRole('heading', { level: 2, name: /synthwave & cyberpunk/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/neuromancer/i)).toBeInTheDocument();
  });

  it('renderiza la cláusula de privacidad en cumplimiento con la Ley 25.326', async () => {
    await renderApp();

    expect(
      screen.getByText(/cumplimiento de privacidad: modo de datos en tránsito/i),
    ).toBeInTheDocument();
  });
});
