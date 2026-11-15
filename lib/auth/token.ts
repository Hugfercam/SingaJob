import { createHash, randomBytes } from "node:crypto";

/**
 * Tokens de sesión.
 *
 * El token en claro solo existe en la cookie del navegador. En la base de datos
 * se guarda su hash SHA-256, así que una filtración de la base no permite
 * suplantar ninguna sesión.
 *
 * SHA-256 es suficiente aquí (a diferencia de las contraseñas) porque el token
 * es aleatorio de 256 bits: no hay diccionario que atacar.
 */

export const SESSION_TOKEN_BYTES = 32;

export function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
