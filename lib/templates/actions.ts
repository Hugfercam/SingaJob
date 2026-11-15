"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import { readField } from "@/lib/forms";
import { Role } from "@/lib/generated/prisma/client";
import { parseFieldDefinitions } from "@/lib/work-orders/fields";

const MAX_NAME = 120;
const MAX_DESCRIPTION = 400;

export type TemplateFormState = { error: string } | null;

/**
 * Alta y edición de plantillas.
 *
 * La definición de campos llega como JSON en un campo oculto y se valida aquí:
 * el editor del navegador es una comodidad, no una garantía.
 */
export async function saveTemplate(
  _previousState: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER);

  const templateId = readField(formData, "templateId");
  const name = readField(formData, "name");
  const description = readField(formData, "description");
  const rawFields = readField(formData, "fields", false);

  if (!name) {
    return { error: "Ponle un nombre a la plantilla." };
  }

  if (name.length > MAX_NAME) {
    return { error: `El nombre no puede pasar de ${MAX_NAME} caracteres.` };
  }

  if (description.length > MAX_DESCRIPTION) {
    return { error: "La descripción es demasiado larga." };
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(rawFields || "[]");
  } catch {
    return { error: "No se pudo leer la definición de campos. Inténtalo de nuevo." };
  }

  const fields = parseFieldDefinitions(parsedJson);

  if (fields.length === 0) {
    return { error: "Añade al menos un campo con su etiqueta." };
  }

  const prisma = getPrisma();

  if (templateId) {
    const updated = await prisma.template.updateMany({
      where: { id: templateId, ...tenantScope(auth.company.id) },
      data: { name, description: description || null, fields },
    });

    if (updated.count === 0) {
      return { error: "Esa plantilla no existe en tu empresa." };
    }
  } else {
    const created = await prisma.template.create({
      data: {
        companyId: auth.company.id,
        name,
        description: description || null,
        fields,
        createdById: auth.user.id,
      },
      select: { id: true },
    });

    revalidatePath("/plantillas");
    redirect(`/plantillas/${created.id}`);
  }

  revalidatePath("/plantillas");
  revalidatePath(`/plantillas/${templateId}`);
  redirect(`/plantillas/${templateId}`);
}
