import type { ReactNode } from "react";

import { OfflineIndicator } from "@/components/offline/offline-indicator";
import { DensityToggle } from "@/components/shell/density-toggle";
import { Nav, type NavItem } from "@/components/shell/nav";
import type { Role } from "@/lib/generated/prisma/client";
import { roleLabel } from "@/lib/domain/roles";

/**
 * Estructura de toda el área privada: cabecera con empresa y modo, navegación
 * inferior en móvil y lateral en escritorio, y el aviso de conexión.
 */
export function AppShell({
  companyName,
  userName,
  role,
  children,
}: {
  companyName: string;
  userName: string;
  role: Role;
  children: ReactNode;
}) {
  const isOffice = role === "ADMIN" || role === "MANAGER";

  const items: NavItem[] = isOffice
    ? [
        { href: "/panel", label: "Hoy", icon: "home" },
        { href: "/partes", label: "Partes", icon: "clip" },
        { href: "/clientes", label: "Clientes", icon: "users" },
        { href: "/mas", label: "Más", icon: "more" },
      ]
    : [
        { href: "/partes", label: "Mis partes", icon: "clip" },
        { href: "/mas", label: "Más", icon: "more" },
      ];

  return (
    <div className="min-h-dvh bg-paper">
      <OfflineIndicator />

      <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold tracking-[0.14em] text-brand uppercase">
              {companyName}
            </p>
            <p className="truncate text-xs text-ink-soft">
              {userName} · {roleLabel(role)}
            </p>
          </div>

          <DensityToggle />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl gap-8 px-4 pt-5 pb-28 lg:pb-12">
        <Nav items={items} />

        <main className="mx-auto flex w-full max-w-md flex-col gap-7 lg:mx-0">
          {children}
        </main>
      </div>
    </div>
  );
}
