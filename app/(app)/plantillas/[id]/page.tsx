import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { TemplateEditor } from "@/components/templates/template-editor";
import { Role } from "@/lib/generated/prisma/client";
import { getTemplate } from "@/lib/templates/queries";

export const metadata: Metadata = {
  title: "Editar plantilla",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { company } = await requireRole(Role.ADMIN, Role.MANAGER);
  const { id } = await params;
  const template = await getTemplate(company.id, id);

  if (!template) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          {company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {template.name}
        </h1>
        <p className="text-sm text-ink-soft">
          Los cambios afectan a los partes nuevos, no a los ya creados.
        </p>
      </header>

      <TemplateEditor
        templateId={template.id}
        initialName={template.name}
        initialDescription={template.description ?? ""}
        initialFields={template.fields}
      />

      <Link
        className="text-sm font-medium text-brand underline underline-offset-4"
        href="/plantillas"
      >
        Volver a plantillas
      </Link>
    </main>
  );
}
