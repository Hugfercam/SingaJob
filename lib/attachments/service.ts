import {
  ACCEPTED_IMAGE_TYPES,
  MAX_ATTACHMENT_BYTES,
  isAttachmentKind,
  isSignatureKind,
} from "@/lib/domain/attachments";
import { tenantScope } from "@/lib/domain/tenant";
import { Role } from "@/lib/generated/prisma/client";
import { getPrisma } from "@/lib/db";

import {
  buildStorageKey,
  deleteAttachmentFile,
  extensionForMime,
  writeAttachmentFile,
} from "./storage";
import { viewerFilter } from "@/lib/work-orders/queries";
import type { Actor, ServiceResult } from "@/lib/work-orders/service";

export type NewAttachmentInput = {
  kind: string;
  fileName: string;
  mimeType: string;
  bytes: Buffer;
  operationId: string;
};

/**
 * Guarda una foto o una firma.
 *
 * Es idempotente por `operationId`: si la cola offline reintenta una subida que
 * ya se aplicó, no se duplica nada (la clave de almacenamiento coincide).
 */
export async function addAttachment(
  actor: Actor,
  workOrderId: string,
  input: NewAttachmentInput,
): Promise<ServiceResult<{ id: string }>> {
  if (!isAttachmentKind(input.kind)) {
    return { ok: false, status: 400, error: "Tipo de adjunto no válido." };
  }

  const extension = extensionForMime(input.mimeType);

  if (!extension || !(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(input.mimeType)) {
    return {
      ok: false,
      status: 415,
      error: "Solo se admiten imágenes JPEG, PNG o WebP.",
    };
  }

  if (input.bytes.length === 0) {
    return { ok: false, status: 400, error: "El archivo está vacío." };
  }

  if (input.bytes.length > MAX_ATTACHMENT_BYTES) {
    return { ok: false, status: 413, error: "La imagen es demasiado grande." };
  }

  const prisma = getPrisma();

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id: workOrderId,
      ...tenantScope(actor.companyId),
      ...viewerFilter({ role: actor.role, userId: actor.userId }),
    },
    select: { id: true, status: true },
  });

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

  const storageKey = buildStorageKey(
    actor.companyId,
    workOrder.id,
    input.operationId,
    extension,
  );

  const existing = await prisma.attachment.findUnique({
    where: { storageKey },
    select: { id: true },
  });

  if (existing) {
    return { ok: true, value: { id: existing.id } };
  }

  await writeAttachmentFile(storageKey, input.bytes);

  try {
    const created = await prisma.attachment.create({
      data: {
        companyId: actor.companyId,
        workOrderId: workOrder.id,
        kind: input.kind,
        fileName: input.fileName.slice(0, 160) || `adjunto.${extension}`,
        mimeType: input.mimeType,
        sizeBytes: input.bytes.length,
        storageKey,
        createdById: actor.userId,
      },
      select: { id: true },
    });

    return { ok: true, value: { id: created.id } };
  } catch (error) {
    // Carrera entre dos reintentos de la misma operación: la primera ganó.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002"
    ) {
      const again = await prisma.attachment.findUnique({
        where: { storageKey },
        select: { id: true },
      });

      if (again) {
        return { ok: true, value: { id: again.id } };
      }
    }

    console.error("Adjunto: no se pudo guardar", error);

    return {
      ok: false,
      status: 500,
      error: "No se pudo guardar el archivo.",
    };
  }
}

/** Las firmas no se borran: son la prueba del cierre. */
export async function deleteAttachment(
  actor: Actor,
  workOrderId: string,
  attachmentId: string,
): Promise<ServiceResult> {
  const prisma = getPrisma();

  const attachment = await prisma.attachment.findFirst({
    where: {
      id: attachmentId,
      workOrderId,
      ...tenantScope(actor.companyId),
    },
    select: { id: true, kind: true, createdById: true, workOrderId: true, storageKey: true },
  });

  if (!attachment) {
    return { ok: false, status: 404, error: "Ese adjunto no existe." };
  }

  if (isSignatureKind(attachment.kind)) {
    return {
      ok: false,
      status: 409,
      error: "Las firmas no se pueden borrar.",
    };
  }

  const isOwner = attachment.createdById === actor.userId;
  const isOffice = actor.role === Role.ADMIN || actor.role === Role.MANAGER;

  if (!isOwner && !isOffice) {
    return { ok: false, status: 403, error: "No puedes borrar esta foto." };
  }

  await prisma.attachment.deleteMany({
    where: { id: attachment.id, ...tenantScope(actor.companyId) },
  });

  await deleteAttachmentFile(attachment.storageKey);

  return { ok: true, value: undefined };
}

export type AttachmentSummary = {
  id: string;
  kind: "PHOTO" | "SIGNATURE_CLIENT" | "SIGNATURE_TECHNICIAN";
  fileName: string;
  createdAt: Date;
};

export async function listAttachments(
  companyId: string,
  workOrderId: string,
): Promise<AttachmentSummary[]> {
  return getPrisma().attachment.findMany({
    where: { workOrderId, ...tenantScope(companyId) },
    orderBy: { createdAt: "asc" },
    select: { id: true, kind: true, fileName: true, createdAt: true },
  });
}

/** Devuelve el adjunto solo si es de la empresa del actor. */
export async function getAttachmentForActor(
  actor: Actor,
  attachmentId: string,
) {
  return getPrisma().attachment.findFirst({
    where: { id: attachmentId, ...tenantScope(actor.companyId) },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      storageKey: true,
    },
  });
}
