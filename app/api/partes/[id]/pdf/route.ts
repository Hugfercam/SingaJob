import { apiError, getActor } from "@/lib/api/auth";
import { readAttachmentFile } from "@/lib/attachments/storage";
import { getPrisma } from "@/lib/db";
import { attachmentKindLabel } from "@/lib/domain/attachments";
import { tenantScope } from "@/lib/domain/tenant";
import {
  formatSignatureDate,
  resolveTechnicianName,
  signatureSignerName,
} from "@/lib/pdf/data";
import { renderAlbaran, type AlbaranData } from "@/lib/pdf/render";
import {
  formatCoordinates,
  formatFieldValue,
} from "@/lib/work-orders/format";
import { readFieldDefinitions } from "@/lib/work-orders/fields";
import { viewerFilter } from "@/lib/work-orders/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();

  if (!actor) {
    return apiError(401, "Tu sesión ha caducado. Vuelve a entrar.");
  }

  const { id } = await params;
  const prisma = getPrisma();

  const workOrder = await prisma.workOrder.findFirst({
    where: {
      id,
      ...tenantScope(actor.companyId),
      ...viewerFilter({ role: actor.role, userId: actor.userId }),
    },
    select: {
      id: true,
      title: true,
      status: true,
      fieldsSnapshot: true,
      values: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      startLatitude: true,
      startLongitude: true,
      endLatitude: true,
      endLongitude: true,
      client: { select: { name: true, address: true, phone: true } },
      project: { select: { name: true } },
      assignedTo: { select: { name: true } },
      createdBy: { select: { name: true } },
      company: { select: { name: true, cif: true, address: true, phone: true } },
      attachments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          kind: true,
          storageKey: true,
          mimeType: true,
          createdAt: true,
        },
      },
    },
  });

  if (!workOrder) {
    return apiError(404, "Ese parte no existe.");
  }

  const fields = readFieldDefinitions(workOrder.fieldsSnapshot);
  const values =
    typeof workOrder.values === "object" && workOrder.values !== null
      ? (workOrder.values as Record<string, unknown>)
      : {};

  const technicianName = resolveTechnicianName(
    workOrder.assignedTo?.name ?? null,
    workOrder.createdBy?.name ?? null,
  );

  const photos: AlbaranData["photos"] = [];
  const signatures: AlbaranData["signatures"] = [];

  for (const attachment of workOrder.attachments) {
    try {
      const bytes = await readAttachmentFile(attachment.storageKey);

      if (attachment.kind === "PHOTO") {
        photos.push({ id: attachment.id, bytes });
      } else {
        signatures.push({
          id: attachment.id,
          label: attachmentKindLabel(attachment.kind),
          name: signatureSignerName({
            kind: attachment.kind,
            clientName: workOrder.client.name,
            technicianName,
          }),
          date: formatSignatureDate(attachment.createdAt),
          bytes,
        });
      }
    } catch {
      // Un archivo perdido no debe impedir generar el albarán.
    }
  }

  const coordinates: AlbaranData["coordinates"] = [];
  const startCoords = formatCoordinates(
    workOrder.startLatitude,
    workOrder.startLongitude,
  );
  const endCoords = formatCoordinates(
    workOrder.endLatitude,
    workOrder.endLongitude,
  );

  if (startCoords) {
    coordinates.push({ label: "Inicio (GPS)", value: startCoords });
  }

  if (endCoords) {
    coordinates.push({ label: "Fin (GPS)", value: endCoords });
  }

  const data: AlbaranData = {
    companyName: workOrder.company.name,
    companyCif: workOrder.company.cif,
    companyAddress: workOrder.company.address,
    companyPhone: workOrder.company.phone,
    title: workOrder.title,
    documentDate: workOrder.completedAt ?? workOrder.createdAt,
    clientName: workOrder.client.name,
    clientAddress: workOrder.client.address,
    clientPhone: workOrder.client.phone,
    projectName: workOrder.project?.name ?? null,
    technicianName,
    createdAt: workOrder.createdAt,
    startedAt: workOrder.startedAt,
    completedAt: workOrder.completedAt,
    coordinates,
    fields: fields.map((field) => ({
      label: field.label,
      value: formatFieldValue(field, values[field.id]),
    })),
    photos,
    signatures,
    generatedAt: new Date(),
  };

  const pdf = await renderAlbaran(data);
  const safeName = workOrder.title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="albaran-${safeName || "parte"}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
