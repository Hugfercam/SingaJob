import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { ClientForm } from "@/components/clients/client-form";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Nuevo cliente",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

export default async function NewClientPage() {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo cliente</h1>
        <p className="text-sm text-ink-soft">
          Solo el nombre es obligatorio. Podrás añadir obras después.
        </p>
      </header>

      <ClientForm mode="create" />

      <Link
        className="text-sm font-medium text-brand underline underline-offset-4"
        href="/clientes"
      >
        Volver a clientes
      </Link>
    </main>
  );
}
