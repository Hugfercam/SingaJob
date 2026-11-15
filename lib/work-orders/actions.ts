"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import { readField } from "@/lib/forms";
import { Role } from "@/lib/generated/prisma/client";

import { readFieldDefinitions, type FieldDefinition } from "./fields";

const MAX_TITLE = 140;

export type CreateWorkOrderState = { error: string } | null;

/**
 * Creación de partes: es trabajo de oficina y siempre con conexión, así que
 * sigue siendo una Server Action.
 *
 * El resto de cambios del parte (valores, estado, fotos y firmas) van por
 * `/api/partes/…` para que se puedan encolar sin conexión. La lógica de ambos
 * caminos está en `service.ts`, que es la que aplica las reglas.
 */
export async function createWorkOrder(
  _previousState: CreateWorkOrderState,
  formData: FormData,
): Promise<CreateWorkOrderState> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER);

  const title = readField(formData, "title");
  const clientId = readField(formData, "clientId");
  const projectId = readField(formData, "projectId");
  const templateId = readField(formData, "templateId");
  const assignedToId = readField(formData, "assignedToId");

  if (!title) {
    return { error: "Ponle un título al parte." };
  }

  if (title.length > MAX_TITLE) {
    return { error: `El título no puede pasar de ${MAX_TITLE} caracteres.` };
  }

  if (!clientId) {
    return { error: "Elige un cliente." };
  }

  const prisma = getPrisma();

  const client = await prisma.client.findFirst({
    where: { id: clientId, ...tenantScope(auth.company.id) },
    select: { id: true },
  });

  if (!client) {
    return { error: "Ese cliente no existe en tu empresa." };
  }

  let project: { id: string } | null = null;

  if (projectId) {
    project = await prisma.project.findFirst({
      where: {
        id: projectId,
        clientId: client.id,
        ...tenantScope(auth.company.id),
      },
      select: { id: true },
    });

    if (!project) {
      return { error: "Esa obra no pertenece a ese cliente." };
    }
  }

  let template: { id: string } | null = null;
  let fields: FieldDefinition[] = [];

  if (templateId) {
    const found = await prisma.template.findFirst({
      where: { id: templateId, ...tenantScope(auth.company.id) },
      select: { id: true, fields: true },
    });

    if (!found) {
      return { error: "Esa plantilla no existe en tu empresa." };
    }

    template = { id: found.id };
    fields = readFieldDefinitions(found.fields);
  }

  let assignee: { id: string } | null = null;

  if (assignedToId) {
    assignee = await prisma.user.findFirst({
      where: {
        id: assignedToId,
        active: true,
        ...tenantScope(auth.company.id),
      },
      select: { id: true },
    });

    if (!assignee) {
      return { error: "Ese técnico no existe en tu empresa." };
    }
  }

  const created = await prisma.workOrder.create({
    data: {
      companyId: auth.company.id,
      clientId: client.id,
      projectId: project?.id ?? null,
      templateId: template?.id ?? null,
      title,
      // Copia de la definición: la plantilla puede cambiar después.
      fieldsSnapshot: fields,
      values: {},
      assignedToId: assignee?.id ?? null,
      createdById: auth.user.id,
    },
    select: { id: true },
  });

  revalidatePath("/partes");
  redirect(`/partes/${created.id}`);
}
