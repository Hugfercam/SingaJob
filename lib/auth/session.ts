import { cookies, headers } from "next/headers";

import { getPrisma } from "@/lib/db";
import type { Role } from "@/lib/generated/prisma/client";

import { generateSessionToken, hashSessionToken } from "./token";

export const SESSION_COOKIE = "signajob_session";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Caducidad absoluta: pasados 30 días hay que volver a entrar. */
const ABSOLUTE_DAYS = 30;

/** Caducidad por inactividad: 7 días sin usar la app. */
const IDLE_DAYS = 7;

/** No se reescribe `lastUsedAt` en cada petición, solo cada hora. */
const TOUCH_INTERVAL_MS = 60 * 60 * 1000;

export type AuthContext = {
  sessionId: string;
  user: {
    id: string;
    companyId: string;
    name: string;
    email: string;
    role: Role;
  };
  company: {
    id: string;
    name: string;
  };
};

/** Extrae una cookie concreta de la cabecera `Cookie`, sin usar `cookies()`. */
function readCookieValue(header: string | null, name: string): string | null {
  if (!header) {
    return null;
  }

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf("=");

    if (separator === -1) {
      continue;
    }

    if (trimmed.slice(0, separator) === name) {
      return decodeURIComponent(trimmed.slice(separator + 1));
    }
  }

  return null;
}

async function readSessionToken(): Promise<string | null> {
  const requestHeaders = await headers();

  return readCookieValue(requestHeaders.get("cookie"), SESSION_COOKIE);
}

type SessionMeta = {
  userAgent?: string | null;
  ip?: string | null;
};

/**
 * Datos del navegador para guardar con la sesión. El `user-agent` sirve para
 * que el usuario reconozca sus dispositivos; no se usa para autorizar nada.
 */
export async function requestMeta(): Promise<SessionMeta> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");

  return {
    userAgent: requestHeaders.get("user-agent"),
    ip: forwarded ? forwarded.split(",")[0]?.trim() : null,
  };
}

export async function createSession(
  userId: string,
  meta: SessionMeta = {},
): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ABSOLUTE_DAYS * DAY_MS);
  const token = generateSessionToken();

  await getPrisma().session.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt,
      lastUsedAt: now,
      userAgent: meta.userAgent?.slice(0, 512) ?? null,
      ip: meta.ip?.slice(0, 64) ?? null,
    },
  });

  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // En local se sirve por HTTP; `secure` solo tiene sentido en producción.
    secure: process.env.NODE_ENV === "production",
    maxAge: ABSOLUTE_DAYS * 24 * 60 * 60,
  });
}

/**
 * Resuelve la sesión de la petición actual.
 *
 * Lee el token de la cabecera `Cookie` en lugar de `cookies()`. En Next 16 con
 * `cacheComponents`, llamar a `cookies()` dentro de una Server Action provoca
 * un error interno cuando la página se re-renderiza en la misma petición
 * ("Received an underlying cookies object that does not match...").
 * `headers()` funciona igual en render y en acción, así que autorizar desde una
 * acción es seguro.
 *
 * Devuelve `null` ante cualquier anomalía (sin cookie, token desconocido,
 * caducado, inactivo o usuario desactivado) y borra la sesión inservible.
 */
export async function readSession(): Promise<AuthContext | null> {
  const token = await readSessionToken();

  if (!token) {
    return null;
  }

  const prisma = getPrisma();

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      expiresAt: true,
      lastUsedAt: true,
      user: {
        select: {
          id: true,
          companyId: true,
          name: true,
          email: true,
          role: true,
          active: true,
          company: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  const now = Date.now();
  const expired = session.expiresAt.getTime() <= now;
  const idle =
    session.lastUsedAt.getTime() + IDLE_DAYS * DAY_MS <= now;

  if (expired || idle || !session.user.active) {
    await prisma.session
      .delete({ where: { id: session.id } })
      .catch(() => undefined);

    return null;
  }

  if (now - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date(now) } })
      .catch(() => undefined);
  }

  return {
    sessionId: session.id,
    user: {
      id: session.user.id,
      companyId: session.user.companyId,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
    company: session.user.company,
  };
}

/** Destruye la sesión actual en el servidor y borra la cookie. */
export async function destroySession(): Promise<void> {
  const token = await readSessionToken();

  if (token) {
    await getPrisma()
      .session.deleteMany({ where: { tokenHash: hashSessionToken(token) } })
      .catch(() => undefined);
  }

  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Revoca todas las sesiones de un usuario (por ejemplo, al desactivarlo). */
export async function destroyUserSessions(userId: string): Promise<void> {
  await getPrisma()
    .session.deleteMany({ where: { userId } })
    .catch(() => undefined);
}
