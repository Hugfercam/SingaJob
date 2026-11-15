import type { ReactNode } from "react";
import { connection } from "next/server";

import { AppShell } from "@/components/shell/app-shell";
import { requireSession } from "@/lib/auth/guards";

/**
 * Área privada: nunca se prerenderiza.
 *
 * `instant = false` permite una ruta bloqueante, que es justo lo que necesita
 * una pantalla que depende de la sesión: no tiene sentido servir un esqueleto
 * y arriesgar que se vea contenido antes de saber quién es el usuario.
 */
export const instant = false;

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Leer cookies es acceso dinámico: no puede prerenderizarse.
  await connection();
  const { user, company } = await requireSession();

  return (
    <AppShell
      companyName={company.name}
      userName={user.name}
      role={user.role}
    >
      {children}
    </AppShell>
  );
}
