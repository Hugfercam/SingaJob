import { NextResponse } from "next/server";

import { readSession } from "@/lib/auth/session";
import type { Actor } from "@/lib/work-orders/service";

/** Autorización para rutas de API: devuelve el actor o `null` (sin redirigir). */
export async function getActor(): Promise<Actor | null> {
  const session = await readSession();

  if (!session) {
    return null;
  }

  return {
    userId: session.user.id,
    companyId: session.user.companyId,
    role: session.user.role,
  };
}

export function apiError(
  status: number,
  error: string,
  errors?: Record<string, string>,
) {
  return NextResponse.json({ ok: false, error, errors }, { status });
}

export function apiOk<T extends object>(value: T) {
  return NextResponse.json({ ok: true, ...value });
}
