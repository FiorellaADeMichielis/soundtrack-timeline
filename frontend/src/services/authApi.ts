import { AuthStatus } from '@soundtrack-timeline/shared';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:4000'
    : 'http://localhost:4000');

export const authApi = {
  /**
   * Obtiene el enlace directo de inicio de sesión con Spotify OAuth2 PKCE.
   */
  getLoginUrl(): string {
    return `${API_BASE_URL}/api/auth/login`;
  },

  /**
   * Consulta el estado de autenticación actual de la sesión.
   */
  async fetchAuthStatus(): Promise<AuthStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return {
          isAuthenticated: false,
          isDemo: true,
        };
      }

      return (await response.json()) as AuthStatus;
    } catch {
      // En caso de fallo o modo offline, fallback seguro a Modo Demo
      return {
        isAuthenticated: false,
        isDemo: true,
      };
    }
  },

  /**
   * Cierra la sesión activa revocando los tokens en memoria.
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch {
      // Fallo silencioso en cliente, el store local restablecerá el modo demo
    }
  },
};
