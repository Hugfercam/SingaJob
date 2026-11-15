/**
 * Limitación de intentos de login.
 *
 * Es una defensa básica contra fuerza bruta, en memoria del proceso. Sirve para
 * desarrollo y para un único servidor, pero NO protege en un despliegue con
 * varias instancias: cada una tiene su propio contador. Cuando haya despliegue
 * real, esto debe pasar a un almacén compartido (Redis o la propia base).
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

export function checkRateLimit(key: string, now: number = Date.now()): RateLimitResult {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });

    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;

  return { allowed: true, retryAfterMs: 0 };
}

export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Limpia ventanas vencidas para que el mapa no crezca sin límite. */
export function pruneRateLimit(now: number = Date.now()): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}
