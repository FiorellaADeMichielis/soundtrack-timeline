import { beforeEach, describe, expect, it } from 'vitest';
import { SessionStoreService, UserSessionData } from './session-store.service';

describe('SessionStoreService', () => {
  let service: SessionStoreService;

  beforeEach(() => {
    service = new SessionStoreService();
    service.onModuleInit();
  });

  it('guarda y consume el code_verifier de OAuth una sola vez', async () => {
    const state = 'test_state_123';
    const verifier = 'test_verifier_abc';

    await service.saveOAuthState(state, verifier, 600);

    const consumed = await service.getAndConsumeOAuthVerifier(state);
    expect(consumed).toBe(verifier);

    // Un segundo intento debe retornar null (garantía de un solo uso contra replay attacks)
    const secondAttempt = await service.getAndConsumeOAuthVerifier(state);
    expect(secondAttempt).toBeNull();
  });

  it('guarda, recupera y destruye sesiones de usuario en memoria efímera', async () => {
    const sessionData: UserSessionData = {
      sessionId: 'sess_123',
      accessToken: 'access_token_xyz',
      refreshToken: 'refresh_token_xyz',
      expiresAt: Date.now() + 3600 * 1000,
      userId: 'usr_spotify_01',
      displayName: 'Gustavo Cerati',
    };

    await service.saveSession(sessionData.sessionId, sessionData, 3600);

    const retrieved = await service.getSession(sessionData.sessionId);
    expect(retrieved).toEqual(sessionData);

    await service.destroySession(sessionData.sessionId);

    const afterDestroy = await service.getSession(sessionData.sessionId);
    expect(afterDestroy).toBeNull();
  });

  it('retorna null si la sesión ha expirado según su TTL', async () => {
    const sessionData: UserSessionData = {
      sessionId: 'sess_expired',
      accessToken: 'token',
      expiresAt: Date.now() - 1000, // Expirado
      userId: 'usr_02',
      displayName: 'Charly',
    };

    // TTL de 0 segundos
    await service.saveSession(sessionData.sessionId, sessionData, -1);

    const retrieved = await service.getSession(sessionData.sessionId);
    expect(retrieved).toBeNull();
  });
});
