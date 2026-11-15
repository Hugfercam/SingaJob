import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/clients/client-form";
import { requireRole } from "@/lib/auth/guards";
import { getClientDetail } from "@/lib/clients/queries";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Editar cliente",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);
  const { id } = await params;
  const client = await getClientDetail(company.id, id);

  if (!client) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar cliente
        </h1>
      </header>

      <ClientForm
        mode="edit"
        clientId={client.id}
        defaults={{
          name: client.name,
          phone: client.phone,
          email: client.email,
          address: client.address,
          notes: client.notes,
        }}
      />

      <Link
        className="text-sm font-medium text-brand underline underline-offset-4"
        href={`/clientes/${client.id}`}
      >
        Volver al cliente
      </Link>
    </main>
  );
}
