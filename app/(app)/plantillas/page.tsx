import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { Role } from "@/lib/generated/prisma/client";
import { listTemplates } from "@/lib/templates/queries";

export const metadata: Metadata = {
  title: "Plantillas",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

export default async function TemplatesPage() {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);
  const templates = await listTemplates(company.id);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Plantillas</h1>
        <p className="text-sm text-ink-soft">
          {templates.length}{" "}
          {templates.length === 1 ? "plantilla" : "plantillas"} de parte.
        </p>
      </header>

      <Link
        className="rounded-lg bg-brand px-4 py-2.5 text-center font-medium text-white transition hover:bg-brand/90"
        href="/plantillas/nueva"
      >
        Nueva plantilla
      </Link>

      {templates.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-ink-soft">
          Todavía no hay plantillas. Crea una con los campos que usáis en cada
          tipo de trabajo.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {templates.map((template) => (
            <li key={template.id}>
              <Link
                className="flex flex-col gap-0.5 px-4 py-3 transition hover:bg-brand-soft/30"
                href={`/plantillas/${template.id}`}
              >
                <span className="font-medium text-ink">
                  {template.name}
                </span>
                <span className="text-sm text-ink-soft">
                  {template.fieldCount}{" "}
                  {template.fieldCount === 1 ? "campo" : "campos"}
                  {template.description ? ` · ${template.description}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        className="text-sm font-medium text-brand underline underline-offset-4"
        href="/panel"
      >
        Volver al panel
      </Link>
    </main>
  );
}
