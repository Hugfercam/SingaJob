/**
 * Normalización del texto de búsqueda.
 *
 * Se aplica antes de consultar: evita enviar a la base términos con espacios
 * repetidos y acota la longitud, porque un `contains` muy largo es trabajo
 * inútil para PostgreSQL.
 */

const MAX_LENGTH = 80;

export function normalizeSearchTerm(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_LENGTH);
}
