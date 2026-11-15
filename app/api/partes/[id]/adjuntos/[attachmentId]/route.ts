import { apiError, apiOk, getActor } from "@/lib/api/auth";
import { deleteAttachment } from "@/lib/attachments/service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> },
) {
  const actor = await getActor();

  if (!actor) {
    return apiError(401, "Tu sesión ha caducado. Vuelve a entrar.");
  }

  const { id, attachmentId } = await params;
  const result = await deleteAttachment(actor, id, attachmentId);

  if (!result.ok) {
    return apiError(result.status, result.error);
  }

  return apiOk({});
}
