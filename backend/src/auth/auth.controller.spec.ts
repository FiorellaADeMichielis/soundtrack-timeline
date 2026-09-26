import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionStoreService } from './session-store.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let sessionStore: SessionStoreService;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStore = new SessionStoreService();
    sessionStore.onModuleInit();
    authService = new AuthService(sessionStore);
    controller = new AuthController(authService);
  });

  it('login redirige a la URL de autorización de Spotify', async () => {
    const redirectMock = vi.fn();
    const mockRes = { redirect: redirectMock } as unknown as Response;

    await controller.login(mockRes);

    expect(redirectMock).toHaveBeenCalledOnce();
    const redirectedUrl = redirectMock.mock.calls[0][0] as string;
    expect(redirectedUrl).toContain('https://accounts.spotify.com/authorize');
  });

  it('callback redirige con error si Spotify envía parámetro error', async () => {
    const redirectMock = vi.fn();
    const mockRes = { redirect: redirectMock } as unknown as Response;

    await controller.callback(undefined, undefined, 'access_denied', mockRes);

    expect(redirectMock).toHaveBeenCalledWith(
      'http://localhost:3000/?auth=error&reason=access_denied',
    );
  });

  it('callback establece cookie de sesión y redirige a la app si el flujo es exitoso', async () => {
    const redirectMock = vi.fn();
    const cookieMock = vi.fn();
    const mockRes = { redirect: redirectMock, cookie: cookieMock } as unknown as Response;

    vi.spyOn(authService, 'handleCallback').mockResolvedValueOnce({
      sessionId: 'sess_abc_123',
      userId: 'usr_01',
      displayName: 'Spinetta',
    });

    await controller.callback('valid_code', 'valid_state', undefined, mockRes);

    expect(cookieMock).toHaveBeenCalledWith(
      'st_session',
      'sess_abc_123',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
      }),
    );
    expect(redirectMock).toHaveBeenCalledWith('http://localhost:3000/?auth=success');
  });

  it('status consulta el estado de autenticación a través de la cookie de sesión', async () => {
    const mockReq = {
      cookies: { st_session: 'some_session' },
    } as unknown as Request;

    vi.spyOn(authService, 'getAuthStatus').mockResolvedValueOnce({
      isAuthenticated: true,
      isDemo: false,
      userId: 'usr_01',
      displayName: 'Spinetta',
    });

    const status = await controller.getStatus(mockReq);

    expect(status.isAuthenticated).toBe(true);
    expect(status.userId).toBe('usr_01');
  });

  it('logout destruye la sesión y borra la cookie en el cliente', async () => {
    const mockReq = {
      cookies: { st_session: 'some_session' },
    } as unknown as Request;
    const clearCookieMock = vi.fn();
    const jsonMock = vi.fn();
    const mockRes = { clearCookie: clearCookieMock, json: jsonMock } as unknown as Response;

    const logoutSpy = vi.spyOn(authService, 'logout').mockResolvedValueOnce();

    await controller.logout(mockReq, mockRes);

    expect(logoutSpy).toHaveBeenCalledWith('some_session');
    expect(clearCookieMock).toHaveBeenCalledWith('st_session', expect.any(Object));
    expect(jsonMock).toHaveBeenCalledWith({ success: true });
  });
});
