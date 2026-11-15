import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Hash de contraseñas con scrypt (incluido en Node, sin dependencias nativas).
 *
 * Formato almacenado: `scrypt$N$r$p$sal$hash`, con los parámetros dentro del
 * propio valor para poder endurecerlos en el futuro sin invalidar las
 * contraseñas existentes.
 */

const ALGORITHM = "scrypt";
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

const DEFAULT_PARAMS = { N: 16_384, r: 8, p: 1 } as const;

// Límites defensivos: si alguien manipula la base de datos y pone un N gigante,
// verificar la contraseña consumiría toda la CPU del servidor.
const MIN_N = 1_024;
const MAX_N = 1_048_576;
const MAX_R = 32;
const MAX_P = 16;

type Params = { N: number; r: number; p: number };

function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  params: Params,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      // NFKC: que dos formas Unicode equivalentes den el mismo hash.
      password.normalize("NFKC"),
      salt,
      keyLength,
      {
        N: params.N,
        r: params.r,
        p: params.p,
        maxmem: 256 * params.N * params.r,
      },
      (error, derived) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derived);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await deriveKey(password, salt, KEY_LENGTH, DEFAULT_PARAMS);

  return [
    ALGORITHM,
    DEFAULT_PARAMS.N,
    DEFAULT_PARAMS.r,
    DEFAULT_PARAMS.p,
    salt.toString("base64url"),
    derived.toString("base64url"),
  ].join("$");
}

/**
 * Devuelve `false` ante cualquier formato desconocido o corrupto. Nunca lanza
 * por datos manipulados: falla cerrado.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");

  if (parts.length !== 6 || parts[0] !== ALGORITHM) {
    return false;
  }

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);

  const paramsValid =
    Number.isInteger(N) &&
    Number.isInteger(r) &&
    Number.isInteger(p) &&
    N >= MIN_N &&
    N <= MAX_N &&
    r >= 1 &&
    r <= MAX_R &&
    p >= 1 &&
    p <= MAX_P;

  if (!paramsValid) {
    return false;
  }

  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");

  if (salt.length === 0 || expected.length === 0) {
    return false;
  }

  let derived: Buffer;

  try {
    derived = await deriveKey(password, salt, expected.length, { N, r, p });
  } catch {
    return false;
  }

  if (derived.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(derived, expected);
}
