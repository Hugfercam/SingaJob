import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/guards";
import { countClientsAndProjects } from "@/lib/clients/queries";
import { roleLabel } from "@/lib/domain/roles";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Panel",
};

// Depende de la sesión: se renderiza en cada petición, nunca en el build.
export const instant = false;

export default async function PanelPage() {
  const { user, company } = await requireSession();
  const { clients, projects } = await countClientsAndProjects(company.id);
  const isOffice = user.role === Role.ADMIN || user.role === Role.MANAGER;

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

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-neutral-200 px-4 py-3">
          <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
            Clientes
          </dt>
          <dd className="text-2xl font-semibold text-neutral-900">{clients}</dd>
        </div>
        <div className="rounded-lg border border-neutral-200 px-4 py-3">
          <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
            Obras
          </dt>
          <dd className="text-2xl font-semibold text-neutral-900">{projects}</dd>
        </div>
      </dl>

      {isOffice ? (
        <nav className="flex flex-col gap-2">
          <Link
            className="rounded-lg bg-emerald-800 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-900"
            href="/clientes"
          >
            Clientes y obras
          </Link>
          <Link
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center font-medium text-neutral-800 transition hover:bg-neutral-100"
            href="/equipo"
          >
            Equipo
          </Link>
        </nav>
      ) : (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-4 text-sm text-neutral-600">
          Tus partes de trabajo aparecerán aquí en la próxima tarea.
        </p>
      )}

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
