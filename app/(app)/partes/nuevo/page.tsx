import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { listClients, listProjectOptions } from "@/lib/clients/queries";
import { Role } from "@/lib/generated/prisma/client";
import { listTemplates } from "@/lib/templates/queries";
import { WorkOrderForm } from "@/components/work-orders/work-order-form";
import { listAssignableUsers } from "@/lib/work-orders/queries";

export const metadata: Metadata = {
  title: "Nuevo parte",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

export default async function NewWorkOrderPage() {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);

  const [clients, projects, templates, users] = await Promise.all([
    listClients(company.id, ""),
    listProjectOptions(company.id),
    listTemplates(company.id),
    listAssignableUsers(company.id),
  ]);

  // Sin clientes no hay parte posible: se manda a crearlos.
  if (clients.length === 0) {
    redirect("/clientes/nuevo");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo parte</h1>
        <p className="text-sm text-ink-soft">
          Elige cliente, plantilla y a quién se lo asignas.
        </p>
      </header>

      <WorkOrderForm
        clients={clients.map((client) => ({
          id: client.id,
          name: client.name,
        }))}
        projects={projects}
        templates={templates.map((template) => ({
          id: template.id,
          name: template.name,
        }))}
        users={users.map((user) => ({
          id: user.id,
          name: user.name,
          role: user.role,
        }))}
      />

      <Link
        className="text-sm font-medium text-brand underline underline-offset-4"
        href="/partes"
      >
        Volver a partes
      </Link>
    </main>
  );
}
