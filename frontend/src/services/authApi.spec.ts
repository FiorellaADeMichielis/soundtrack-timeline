import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './authApi';

describe('authApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna la URL correcta para el inicio de sesión', () => {
    const loginUrl = authApi.getLoginUrl();
    expect(loginUrl).toContain('/api/auth/login');
  });

  it('consulta el estado de autenticación exitosamente', async () => {
    const mockStatus = {
      isAuthenticated: true,
      isDemo: false,
      userId: 'usr_mock_123',
      displayName: 'Gustavo',
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStatus,
    });
    vi.stubGlobal('fetch', mockFetch);

    const status = await authApi.fetchAuthStatus();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/status'),
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(status).toEqual(mockStatus);
  });

  it('retorna modo demo seguro si fetch falla con error de red o 500', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const status = await authApi.fetchAuthStatus();
    expect(status.isAuthenticated).toBe(false);
    expect(status.isDemo).toBe(true);
  });

  it('ejecuta logout con método POST y credenciales incluidas', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await authApi.logout();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/logout'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });
});
