import { apiError, getActor } from "@/lib/api/auth";
import { getAttachmentForActor } from "@/lib/attachments/service";
import { readAttachmentFile } from "@/lib/attachments/storage";

/**
 * Sirve una foto o una firma.
 *
 * No es una carpeta pública: sin sesión no se sirve nada, y la comprobación de
 * empresa impide que un usuario lea adjuntos de otra empresa adivinando el id.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();

  if (!actor) {
    return apiError(401, "No autorizado.");
  }

  const { id } = await params;
  const attachment = await getAttachmentForActor(actor, id);

  if (!attachment) {
    return apiError(404, "Ese archivo no existe.");
  }

  try {
    const bytes = await readAttachmentFile(attachment.storageKey);

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${encodeURIComponent(attachment.fileName)}"`,
      },
    });
  } catch {
    return apiError(404, "El archivo ya no está disponible.");
  }
}
