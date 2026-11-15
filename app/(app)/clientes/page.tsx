import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { listClients } from "@/lib/clients/queries";
import { normalizeSearchTerm } from "@/lib/domain/search";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Clientes",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);
  const params = await searchParams;
  const term = normalizeSearchTerm(
    typeof params.q === "string" ? params.q : "",
  );
  const clients = await listClients(company.id, term);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
        <p className="text-sm text-neutral-600">
          {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
          {term ? ` para «${term}»` : ""}.
        </p>
      </header>

      <form method="get" className="flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={term}
          placeholder="Nombre, teléfono, email o dirección"
          aria-label="Buscar clientes"
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
        />
        <button
          type="submit"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
        >
          Buscar
        </button>
      </form>

      <Link
        className="rounded-lg bg-emerald-800 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-900"
        href="/clientes/nuevo"
      >
        Nuevo cliente
      </Link>

      {clients.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600">
          {term
            ? "Ningún cliente coincide con esa búsqueda."
            : "Todavía no tienes clientes. Crea el primero para poder asociarle obras."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                className="flex flex-col gap-0.5 px-4 py-3 transition hover:bg-neutral-50"
                href={`/clientes/${client.id}`}
              >
                <span className="font-medium text-neutral-900">
                  {client.name}
                </span>
                <span className="text-sm text-neutral-600">
                  {client.address ? `${client.address} · ` : ""}
                  {client.phone ? `${client.phone} · ` : ""}
                  {client.projectCount}{" "}
                  {client.projectCount === 1 ? "obra" : "obras"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/panel"
      >
        Volver al panel
      </Link>
    </main>
  );
}
