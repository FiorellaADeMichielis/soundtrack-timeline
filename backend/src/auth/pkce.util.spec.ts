import { describe, expect, it } from 'vitest';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateRandomString,
  generateState,
} from './pkce.util';

describe('PKCE Utilities (RFC 7636)', () => {
  it('genera cadenas aleatorias de la longitud especificada en formato base64url', () => {
    const str32 = generateRandomString(32);
    const str64 = generateRandomString(64);

    expect(str32).toHaveLength(32);
    expect(str64).toHaveLength(64);
    // Solo caracteres válidos en Base64URL
    expect(str64).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('genera un code_verifier con longitud válida entre 43 y 128 caracteres', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
    expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('calcula el code_challenge determinista para un code_verifier conocido', () => {
    // Vector de prueba RFC 7636 Anexo B
    // verifier: dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
    // challenge esperado: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
    const testVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
    const challenge = generateCodeChallenge(testVerifier);

    expect(challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });

  it('genera un parámetro state criptográfico no predecible', () => {
    const state1 = generateState();
    const state2 = generateState();

    expect(state1).toHaveLength(32);
    expect(state2).toHaveLength(32);
    expect(state1).not.toBe(state2);
  });
});
