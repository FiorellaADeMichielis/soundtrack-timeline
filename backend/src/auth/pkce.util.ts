import { randomBytes, createHash } from 'crypto';

/**
 * Genera una cadena aleatoria criptográficamente segura compatible con RFC 7636.
 * Caracteres permitidos: [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
 */
export function generateRandomString(length: number = 64): string {
  const bytes = randomBytes(length);
  return bytes.toString('base64url').slice(0, length);
}

/**
 * Genera un code_verifier para OAuth2 PKCE (longitud recomendada: 64 a 128 caracteres).
 */
export function generateCodeVerifier(): string {
  return generateRandomString(64);
}

/**
 * Calcula el code_challenge mediante SHA-256 en formato Base64URL sin relleno (padding).
 */
export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Genera un parámetro `state` criptográfico para mitigar ataques CSRF.
 */
export function generateState(): string {
  return generateRandomString(32);
}
