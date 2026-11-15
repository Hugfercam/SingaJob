import type { Metadata } from "next";

import { logout } from "@/lib/auth/actions";
import { requireSession } from "@/lib/auth/guards";
import { roleLabel } from "@/lib/domain/roles";

export const metadata: Metadata = {
  title: "Panel",
};

// Depende de la sesión: se renderiza en cada petición, nunca en el build.
export const instant = false;

export default async function PanelPage() {
  const { user, company } = await requireSession();

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

      <section className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
        Aquí irán los partes de trabajo, los clientes y el fichaje. De momento
        esta pantalla solo confirma que tu sesión funciona.
      </section>

      <a
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/equipo"
      >
        Ver el equipo
      </a>

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
