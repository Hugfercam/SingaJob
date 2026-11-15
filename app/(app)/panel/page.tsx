import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/guards";
import { countClientsAndProjects } from "@/lib/clients/queries";
import { roleLabel } from "@/lib/domain/roles";
import { Role } from "@/lib/generated/prisma/client";
import { countWorkOrders } from "@/lib/work-orders/queries";

export const metadata: Metadata = {
  title: "Panel",
};

// Depende de la sesión: se renderiza en cada petición, nunca en el build.
export const instant = false;

export default async function PanelPage() {
  const { user, company } = await requireSession();
  const isOffice = user.role === Role.ADMIN || user.role === Role.MANAGER;

  const viewer = { role: user.role, userId: user.id };
  const [workOrders, { clients, projects }] = await Promise.all([
    countWorkOrders(company.id, viewer),
    countClientsAndProjects(company.id),
  ]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {user.name}
        </h1>
        <p className="text-sm text-neutral-600">
          {user.email} · {roleLabel(user.role)}
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          {isOffice ? "Partes" : "Mis partes"}
        </h2>
        <dl className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-neutral-200 px-3 py-2">
            <dt className="text-xs text-neutral-500">Pendientes</dt>
            <dd className="text-xl font-semibold text-neutral-900">
              {workOrders.pending}
            </dd>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <dt className="text-xs text-emerald-900">En curso</dt>
            <dd className="text-xl font-semibold text-emerald-900">
              {workOrders.inProgress}
            </dd>
          </div>
          <div className="rounded-lg border border-neutral-200 px-3 py-2">
            <dt className="text-xs text-neutral-500">Completados</dt>
            <dd className="text-xl font-semibold text-neutral-900">
              {workOrders.completed}
            </dd>
          </div>
        </dl>
      </section>

      {isOffice ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            Empresa
          </h2>
          <dl className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-neutral-200 px-3 py-2">
              <dt className="text-xs text-neutral-500">Clientes</dt>
              <dd className="text-xl font-semibold text-neutral-900">
                {clients}
              </dd>
            </div>
            <div className="rounded-lg border border-neutral-200 px-3 py-2">
              <dt className="text-xs text-neutral-500">Obras</dt>
              <dd className="text-xl font-semibold text-neutral-900">
                {projects}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <nav className="flex flex-col gap-2">
        <Link
          className="rounded-lg bg-emerald-800 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-900"
          href="/partes"
        >
          {isOffice ? "Partes de trabajo" : "Mis partes"}
        </Link>

        {isOffice ? (
          <>
            <Link
              className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center font-medium text-neutral-800 transition hover:bg-neutral-100"
              href="/clientes"
            >
              Clientes y obras
            </Link>
            <Link
              className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center font-medium text-neutral-800 transition hover:bg-neutral-100"
              href="/plantillas"
            >
              Plantillas
            </Link>
            <Link
              className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center font-medium text-neutral-800 transition hover:bg-neutral-100"
              href="/equipo"
            >
              Equipo
            </Link>
          </>
        ) : null}
      </nav>

      <form action={logout}>
        <button
          type="submit"
          className="rounded-lg border border-neutral-300 px-4 py-2.5 font-medium text-neutral-800 transition hover:bg-neutral-100"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
