import type { AttachmentKind } from "@/lib/generated/prisma/client";

export const ATTACHMENT_KINDS = [
  "PHOTO",
  "SIGNATURE_CLIENT",
  "SIGNATURE_TECHNICIAN",
] as const;

const LABELS: Record<AttachmentKind, string> = {
  PHOTO: "Foto",
  SIGNATURE_CLIENT: "Firma del cliente",
  SIGNATURE_TECHNICIAN: "Firma del técnico",
};

export function attachmentKindLabel(kind: AttachmentKind): string {
  return LABELS[kind];
}

export function isAttachmentKind(value: string): value is AttachmentKind {
  return (ATTACHMENT_KINDS as readonly string[]).includes(value);
}

export function isSignatureKind(kind: AttachmentKind): boolean {
  return kind === "SIGNATURE_CLIENT" || kind === "SIGNATURE_TECHNICIAN";
}

/** Límite por archivo: una foto de móvil comprimida no llega ni de lejos. */
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
