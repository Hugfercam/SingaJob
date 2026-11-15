import type { AttachmentKind } from "@/lib/generated/prisma/client";

/**
 * Reglas de quién firma y quién figura como técnico en el albarán.
 *
 * Están aquí, separadas del PDF, para poder probarlas sin generar documentos.
 */

/**
 * El técnico del parte es el asignado; si no lo hay, quien lo creó. Sin esto,
 * un parte completado por alguien sin asignación salía con «—» aunque hubiera
 * firmado.
 */
export function resolveTechnicianName(
  assignedTo: string | null,
  createdBy: string | null,
): string | null {
  const name = assignedTo?.trim() || createdBy?.trim();

  return name ? name : null;
}

/** Nombre que acompaña a cada firma. */
export function signatureSignerName({
  kind,
  clientName,
  technicianName,
}: {
  kind: AttachmentKind;
  clientName: string;
  technicianName: string | null;
}): string {
  if (kind === "SIGNATURE_CLIENT") {
    return clientName;
  }

  return technicianName ?? "Técnico";
}

/** Fecha de la firma, en corto: es una anotación, no un dato principal. */
export function formatSignatureDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
