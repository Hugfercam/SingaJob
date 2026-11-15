"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import {
  TECHNICIAN_ALLOWED_STATUSES,
  isWorkOrderStatus,
} from "@/lib/domain/work-orders";
import { readField } from "@/lib/forms";
import { Role } from "@/lib/generated/prisma/client";

import {
  readFieldDefinitions,
  validateValues,
  type FieldDefinition,
  type WorkOrderValues,
} from "./fields";
import { viewerFilter } from "./queries";

const MAX_TITLE = 140;

export type CreateWorkOrderState = { error: string } | null;

export type ValuesState =
  | { status: "error"; error: string; errors?: Record<string, string> }
  | { status: "saved" }
  | null;

export type StatusState = { status: "error"; error: string } | null;

/**
 * Recoge los valores del formulario según la definición del parte.
 * Cada control se llama `field_<id>`; las casillas usan `on` y las listas
 * llegan repetidas.
 */
function readValuesFromForm(
  fields: FieldDefinition[],
  formData: FormData,
): WorkOrderValues {
  const raw: WorkOrderValues = {};

  for (const field of fields) {
    const name = `field_${field.id}`;

    if (field.type === "CHECKBOX") {
      raw[field.id] = formData.get(name) === "on";
    } else if (field.type === "CHECKLIST") {
      raw[field.id] = formData
        .getAll(name)
        .filter((value): value is string => typeof value === "string");
    } else {
      const value = formData.get(name);
      raw[field.id] = typeof value === "string" ? value : "";
    }
  }

  return raw;
}

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

/**
 * Guarda el borrador del parte. No exige los campos obligatorios: eso se pide
 * al completarlo. Sí valida que cada valor tenga el tipo correcto.
 */
export async function saveWorkOrderValues(
  _previousState: ValuesState,
  formData: FormData,
): Promise<ValuesState> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER, Role.TECHNICIAN);
  const workOrderId = readField(formData, "workOrderId");

  if (!workOrderId) {
    return { status: "error", error: "Falta el parte." };
  }

  const prisma = getPrisma();
  const viewer = { role: auth.user.role, userId: auth.user.id };

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: workOrderId,
      ...tenantScope(auth.company.id),
      ...viewerFilter(viewer),
    },
    select: { id: true, status: true, fieldsSnapshot: true },
  });

  if (!workOrder) {
    return {
      status: "error",
      error: "Ese parte no existe o no está asignado a ti.",
    };
  }

  if (workOrder.status === "COMPLETED" || workOrder.status === "CANCELLED") {
    return { status: "error", error: "Este parte ya está cerrado." };
  }

  const fields = readFieldDefinitions(workOrder.fieldsSnapshot);
  const result = validateValues(fields, readValuesFromForm(fields, formData));

  if (!result.ok) {
    return {
      status: "error",
      error: "Revisa los campos marcados.",
      errors: result.errors,
    };
  }

  await prisma.workOrder.updateMany({
    where: { id: workOrder.id, ...tenantScope(auth.company.id) },
    data: { values: result.values },
  });

  revalidatePath(`/partes/${workOrder.id}`);

  return { status: "saved" };
}

/** Cambia el estado respetando quién puede hacerlo y qué falta para completar. */
export async function changeWorkOrderStatus(
  _previousState: StatusState,
  formData: FormData,
): Promise<StatusState> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER, Role.TECHNICIAN);

  const workOrderId = readField(formData, "workOrderId");
  const target = readField(formData, "status");

  if (!workOrderId || !isWorkOrderStatus(target)) {
    return { status: "error", error: "Estado no válido." };
  }

  const prisma = getPrisma();
  const viewer = { role: auth.user.role, userId: auth.user.id };

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: workOrderId,
      ...tenantScope(auth.company.id),
      ...viewerFilter(viewer),
    },
    select: {
      id: true,
      status: true,
      fieldsSnapshot: true,
      values: true,
      startedAt: true,
    },
  });

  if (!workOrder) {
    return {
      status: "error",
      error: "Ese parte no existe o no está asignado a ti.",
    };
  }

  if (workOrder.status === "COMPLETED") {
    return { status: "error", error: "Este parte ya está completado." };
  }

  if (workOrder.status === "CANCELLED") {
    return { status: "error", error: "Este parte está cancelado." };
  }

  if (
    auth.user.role === Role.TECHNICIAN &&
    !TECHNICIAN_ALLOWED_STATUSES.includes(target)
  ) {
    return { status: "error", error: "Solo la oficina puede cancelar un parte." };
  }

  const base = { id: workOrder.id, ...tenantScope(auth.company.id) };

  if (target === "COMPLETED") {
    const fields = readFieldDefinitions(workOrder.fieldsSnapshot);
    const check = validateValues(fields, workOrder.values, {
      enforceRequired: true,
    });

    if (!check.ok) {
      const missing = fields
        .filter((field) => check.errors[field.id])
        .map((field) => field.label);

      return {
        status: "error",
        error: `Antes de completar, rellena: ${missing.join(", ")}.`,
      };
    }

    await prisma.workOrder.updateMany({
      where: base,
      data: {
        status: target,
        completedAt: new Date(),
        values: check.values,
      },
    });
  } else if (target === "IN_PROGRESS") {
    await prisma.workOrder.updateMany({
      where: base,
      data: { status: target, startedAt: workOrder.startedAt ?? new Date() },
    });
  } else {
    await prisma.workOrder.updateMany({
      where: base,
      data: { status: target },
    });
  }

  revalidatePath("/partes");
  revalidatePath(`/partes/${workOrder.id}`);

  return null;
}
