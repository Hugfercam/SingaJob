import { redirect } from "next/navigation";

import type { Role } from "@/lib/generated/prisma/client";

import { readSession, type AuthContext } from "./session";

/**
 * Exige sesión válida. Se usa en el servidor, en el layout del grupo protegido,
 * para que ninguna página de dentro pueda renderizarse sin usuario.
 */
export async function requireSession(): Promise<AuthContext> {
  const auth = await readSession({ requestTime: true });

  if (!auth) {
    redirect("/login");
  }

  return auth;
}

/**
 * Exige sesión y uno de los roles indicados. Si el rol no alcanza, devuelve al
 * panel en lugar de a login: el usuario sí está autenticado, lo que no tiene es
 * permiso.
 */
export async function requireRole(...roles: Role[]): Promise<AuthContext> {
  const auth = await requireSession();

  if (!roles.includes(auth.user.role)) {
    redirect("/panel");
  }

  return auth;
}
