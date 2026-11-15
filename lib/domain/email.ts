/**
 * Normalización y validación de email.
 *
 * El login se hace por email sin pedir la empresa, y el email es único en la
 * base de datos. Por eso hay que normalizarlo siempre antes de compararlo:
 * `Ana@Empresa.com` y `ana@empresa.com` deben ser la misma cuenta.
 */

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Comprobación pragmática: descarta basura evidente sin intentar implementar
 * la RFC 5322. La validación real de que el email existe es enviar un correo.
 */
export function isValidEmail(value: string): boolean {
  if (value.length === 0 || value.length > 254) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
