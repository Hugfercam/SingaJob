import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { listClients } from "@/lib/clients/queries";
import { normalizeSearchTerm } from "@/lib/domain/search";
import {
  buttonClass,
  Card,
  controlClass,
  EmptyState,
} from "@/components/ui/primitives";
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
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl leading-tight font-semibold text-ink">
          Clientes
        </h1>
        <p className="text-sm text-ink-soft">
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
          className={controlClass}
        />
        <button type="submit" className={buttonClass({ variant: "secondary" })}>
          Buscar
        </button>
      </form>

      <Link
        href="/clientes/nuevo"
        className={buttonClass({ size: "lg", className: "w-full" })}
      >
        Nuevo cliente
      </Link>

      {clients.length === 0 ? (
        <EmptyState
          title={
            term ? "Ningún cliente coincide" : "Todavía no tienes clientes"
          }
          description={
            term
              ? "Prueba con otro nombre, teléfono o dirección."
              : "Crea el primero para poder asociarle obras y partes."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link href={`/clientes/${client.id}`} className="block">
                <Card className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-brand-soft/30">
                  <span className="font-medium text-ink">{client.name}</span>
                  <span className="text-sm text-ink-soft">
                    {client.address ? `${client.address} · ` : ""}
                    {client.phone ? `${client.phone} · ` : ""}
                    {client.projectCount}{" "}
                    {client.projectCount === 1 ? "obra" : "obras"}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
