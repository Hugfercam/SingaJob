import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import {
  TECHNICIAN_ALLOWED_STATUSES,
  isWorkOrderStatus,
} from "@/lib/domain/work-orders";
import { Role } from "@/lib/generated/prisma/client";

import { readFieldDefinitions, validateValues } from "./fields";
import { viewerFilter } from "./queries";

/**
 * Reglas del parte, sin saber si la llamada viene de una ruta de API o de una
 * Server Action. Así el camino con conexión y el de la cola offline aplican
 * exactamente las mismas comprobaciones.
 */
export type Actor = {
  userId: string;
  companyId: string;
  role: Role;
};

export type ServiceResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; status: number; error: string; errors?: Record<string, string> };

type Location = { latitude: number; longitude: number };

function isValidLocation(value: unknown): value is Location {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const { latitude, longitude } = value as Record<string, unknown>;

  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180
  );
}

async function findWorkOrder(actor: Actor, workOrderId: string) {
  return getPrisma().workOrder.findFirst({
    where: {
      id: workOrderId,
      ...tenantScope(actor.companyId),
      ...viewerFilter({ role: actor.role, userId: actor.userId }),
    },
    select: {
      id: true,
      status: true,
      fieldsSnapshot: true,
      values: true,
      startedAt: true,
    },
  });
}

export async function saveValues(
  actor: Actor,
  workOrderId: string,
  rawValues: unknown,
): Promise<ServiceResult> {
  const workOrder = await findWorkOrder(actor, workOrderId);

  if (!workOrder) {
    return {
      ok: false,
      status: 404,
      error: "Ese parte no existe o no está asignado a ti.",
    };
  }

  if (workOrder.status === "COMPLETED" || workOrder.status === "CANCELLED") {
    return { ok: false, status: 409, error: "Este parte ya está cerrado." };
  }

  const fields = readFieldDefinitions(workOrder.fieldsSnapshot);
  const result = validateValues(fields, rawValues);

  if (!result.ok) {
    return {
      ok: false,
      status: 400,
      error: "Revisa los campos marcados.",
      errors: result.errors,
    };
  }

  await getPrisma().workOrder.updateMany({
    where: { id: workOrder.id, ...tenantScope(actor.companyId) },
    data: { values: result.values },
  });

  return { ok: true, value: undefined };
}

export async function changeStatus(
  actor: Actor,
  workOrderId: string,
  target: string,
  location?: unknown,
): Promise<ServiceResult> {
  if (!isWorkOrderStatus(target)) {
    return { ok: false, status: 400, error: "Estado no válido." };
  }

  const workOrder = await findWorkOrder(actor, workOrderId);

  if (!workOrder) {
    return {
      ok: false,
      status: 404,
      error: "Ese parte no existe o no está asignado a ti.",
    };
  }

  if (workOrder.status === "COMPLETED") {
    return { ok: false, status: 409, error: "Este parte ya está completado." };
  }

  if (workOrder.status === "CANCELLED") {
    return { ok: false, status: 409, error: "Este parte está cancelado." };
  }

  if (
    actor.role === Role.TECHNICIAN &&
    !TECHNICIAN_ALLOWED_STATUSES.includes(target)
  ) {
    return {
      ok: false,
      status: 403,
      error: "Solo la oficina puede cancelar un parte.",
    };
  }

  const coords = isValidLocation(location) ? location : null;
  const base = { id: workOrder.id, ...tenantScope(actor.companyId) };

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
        ok: false,
        status: 400,
        error: `Antes de completar, rellena: ${missing.join(", ")}.`,
      };
    }

    await getPrisma().workOrder.updateMany({
      where: base,
      data: {
        status: target,
        completedAt: new Date(),
        values: check.values,
        ...(coords
          ? { endLatitude: coords.latitude, endLongitude: coords.longitude }
          : {}),
      },
    });

    return { ok: true, value: undefined };
  }

  if (target === "IN_PROGRESS") {
    await getPrisma().workOrder.updateMany({
      where: base,
      data: {
        status: target,
        startedAt: workOrder.startedAt ?? new Date(),
        ...(coords
          ? { startLatitude: coords.latitude, startLongitude: coords.longitude }
          : {}),
      },
    });

    return { ok: true, value: undefined };
  }

  await getPrisma().workOrder.updateMany({
    where: base,
    data: { status: target },
  });

  return { ok: true, value: undefined };
}
