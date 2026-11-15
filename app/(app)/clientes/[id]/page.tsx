import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/clients/project-form";
import { ProjectStatusForm } from "@/components/clients/project-status-form";
import { requireRole } from "@/lib/auth/guards";
import { getClientDetail } from "@/lib/clients/queries";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Cliente",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function ClientDetailPage({
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
        {client.address ? (
          <p className="text-sm text-neutral-600">{client.address}</p>
        ) : null}
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Contacto
        </h2>
        <div className="flex flex-col gap-1 rounded-lg border border-neutral-200 px-4 py-3 text-sm">
          {client.phone ? (
            <a
              className="font-medium text-emerald-800"
              href={`tel:${client.phone.replace(/\s+/g, "")}`}
            >
              {client.phone}
            </a>
          ) : (
            <span className="text-neutral-500">Sin teléfono</span>
          )}
          {client.email ? (
            <a
              className="text-emerald-800 underline underline-offset-4"
              href={`mailto:${client.email}`}
            >
              {client.email}
            </a>
          ) : (
            <span className="text-neutral-500">Sin email</span>
          )}
          {client.notes ? (
            <p className="mt-1 whitespace-pre-line text-neutral-600">
              {client.notes}
            </p>
          ) : null}
        </div>

        <Link
          className="self-start text-sm font-medium text-emerald-800 underline underline-offset-4"
          href={`/clientes/${client.id}/editar`}
        >
          Editar cliente
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Obras ({client.projects.length})
        </h2>

        {client.projects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-4 text-center text-sm text-neutral-600">
            Este cliente todavía no tiene obras.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {client.projects.map((project) => (
              <li
                key={project.id}
                className="flex flex-col gap-2 px-4 py-3"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium text-neutral-900">
                    {project.name}
                  </span>
                  <span className="text-sm text-neutral-600">
                    {project.address ? `${project.address} · ` : ""}
                    desde {dateFormat.format(project.createdAt)}
                  </span>
                </div>
                <ProjectStatusForm
                  projectId={project.id}
                  status={project.status}
                />
              </li>
            ))}
          </ul>
        )}

        <ProjectForm clientId={client.id} />
      </section>

      <Link
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/clientes"
      >
        Volver a clientes
      </Link>
    </main>
  );
}
