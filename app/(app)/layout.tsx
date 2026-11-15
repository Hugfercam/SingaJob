import type { ReactNode } from "react";
import { connection } from "next/server";

import { OfflineIndicator } from "@/components/offline/offline-indicator";
import { requireSession } from "@/lib/auth/guards";

/**
 * Área privada: nunca se prerenderiza.
 *
 * `instant = false` permite una ruta bloqueante, que es justo lo que necesita
 * una pantalla que depende de la sesión: no tiene sentido servir un esqueleto
 * y arriesgar que se vea contenido antes de saber quién es el usuario.
 */
export const instant = false;

/**
 * Layout del área privada.
 *
 * La sesión se comprueba aquí, en el servidor, y no con middleware: así ninguna
 * página del grupo puede renderizarse sin usuario, aunque alguien olvide
 * llamar al guard en una ruta nueva.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Leer cookies es acceso dinámico: no puede prerenderizarse.
  await connection();
  await requireSession();

  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
}
