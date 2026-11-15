import type { Metadata } from "next";

import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { roleLabel } from "@/lib/domain/roles";
import { tenantScope } from "@/lib/domain/tenant";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Equipo",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

/**
 * Lista del equipo de la empresa.
 *
 * Es la primera pantalla con permiso por rol: solo administradores y encargados.
 * La consulta filtra siempre por `companyId`: el aislamiento entre empresas no
 * lo garantiza el framework.
 */
export default async function TeamPage() {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);

  const users = await getPrisma().user.findMany({
    where: tenantScope(company.id),
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Equipo</h1>
        <p className="text-sm text-neutral-600">
          {users.length} {users.length === 1 ? "persona" : "personas"} en la
          empresa.
        </p>
      </header>

      <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {users.map((user) => (
          <li key={user.id} className="flex flex-col gap-0.5 px-4 py-3">
            <span className="font-medium text-neutral-900">
              {user.name}
              {user.active ? null : (
                <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-normal text-neutral-600">
                  inactivo
                </span>
              )}
            </span>
            <span className="text-sm text-neutral-600">
              {user.email} · {roleLabel(user.role)}
            </span>
          </li>
        ))}
      </ul>

      <a
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/panel"
      >
        Volver al panel
      </a>
    </main>
  );
}
