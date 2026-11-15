import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/lib/auth/guards";
import { TemplateEditor } from "@/components/templates/template-editor";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Nueva plantilla",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

export default async function NewTemplatePage() {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Nueva plantilla
        </h1>
        <p className="text-sm text-neutral-600">
          Define los campos que se rellenan en este tipo de trabajo.
        </p>
      </header>

      <TemplateEditor
        initialName=""
        initialDescription=""
        initialFields={[]}
      />

      <Link
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/plantillas"
      >
        Volver a plantillas
      </Link>
    </main>
  );
}
