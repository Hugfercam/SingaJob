import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/guards";
import { Button, Card, SectionTitle } from "@/components/ui/primitives";
import { roleLabel } from "@/lib/domain/roles";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Más",
};

export const instant = false;

export default async function MorePage() {
  const { user } = await requireSession();
  const isOffice = user.role === Role.ADMIN || user.role === Role.MANAGER;

  const links = isOffice
    ? [
        { href: "/mas/empresa", label: "Datos de la empresa" },
        { href: "/plantillas", label: "Plantillas de parte" },
        { href: "/equipo", label: "Equipo" },
        { href: "/clientes", label: "Clientes y obras" },
      ]
    : [{ href: "/partes", label: "Mis partes" }];

  return (
    <>
      <SectionTitle>Tu cuenta</SectionTitle>

      <Card className="flex flex-col gap-1 px-4 py-3">
        <p className="font-medium text-ink">{user.name}</p>
        <p className="text-sm text-ink-soft">{user.email}</p>
        <p className="text-sm text-ink-soft">{roleLabel(user.role)}</p>
      </Card>

      <SectionTitle>Ajustes</SectionTitle>

      <Card className="flex flex-col divide-y divide-line">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="tap flex items-center justify-between px-4 py-3 text-ink transition-colors hover:bg-brand-soft/40"
          >
            <span className="font-medium">{link.label}</span>
            <span aria-hidden="true" className="text-ink-soft">
              →
            </span>
          </Link>
        ))}
      </Card>

      <p className="text-xs text-ink-soft">
        El botón <strong className="font-semibold">Modo obra</strong> de arriba
        agranda la letra y los controles para trabajar con guantes o al sol. Se
        guarda en este dispositivo.
      </p>

      <form action={logout}>
        <Button type="submit" variant="secondary" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </>
  );
}
