import type { Metadata } from "next";
import { headers } from "next/headers";

import { InviteForm } from "@/components/invitations/invite-form";
import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { roleLabel } from "@/lib/domain/roles";
import { tenantScope } from "@/lib/domain/tenant";
import { Role } from "@/lib/generated/prisma/client";
import { revokeInvitation } from "@/lib/invitations/actions";
import { listPendingInvitations } from "@/lib/invitations/queries";

export const metadata: Metadata = {
  title: "Equipo",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
});

export default async function TeamPage() {
  const { company, user } = await requireRole(Role.ADMIN, Role.MANAGER);
  const isAdmin = user.role === Role.ADMIN;

  const users = await getPrisma().user.findMany({
    where: tenantScope(company.id),
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  const pending = isAdmin ? await listPendingInvitations(company.id) : [];

  const roleOptions = [Role.TECHNICIAN, Role.MANAGER, Role.ADMIN].map(
    (role) => ({ value: role, label: roleLabel(role) }),
  );

  // El origen se resuelve en el servidor: así el enlace ya es absoluto y se
  // puede copiar tal cual, sin depender de `window` en el cliente.
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto");
  const protocol =
    forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  const origin = host ? `${protocol}://${host}` : "";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-6 py-12">
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

      {isAdmin ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Invitar a alguien
          </h2>
          <InviteForm roleOptions={roleOptions} origin={origin} />

          {pending.length > 0 ? (
            <ul className="mt-2 flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
              {pending.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-neutral-900">
                      {invitation.email}
                    </span>
                    <span className="text-xs text-neutral-600">
                      {roleLabel(invitation.role)} · caduca el{" "}
                      {dateFormat.format(invitation.expiresAt)}
                    </span>
                  </div>
                  <form action={revokeInvitation}>
                    <input type="hidden" name="id" value={invitation.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      Revocar
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Personas
        </h2>
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {users.map((member) => (
            <li key={member.id} className="flex flex-col gap-0.5 px-4 py-3">
              <span className="font-medium text-neutral-900">
                {member.name}
                {member.active ? null : (
                  <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-normal text-neutral-600">
                    inactivo
                  </span>
                )}
              </span>
              <span className="text-sm text-neutral-600">
                {member.email} · {roleLabel(member.role)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <a
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/panel"
      >
        Volver al panel
      </a>
    </main>
  );
}
