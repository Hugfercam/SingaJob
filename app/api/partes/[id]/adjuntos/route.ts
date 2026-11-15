import { apiError, apiOk, getActor } from "@/lib/api/auth";
import { addAttachment } from "@/lib/attachments/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();

  if (!actor) {
    return apiError(401, "Tu sesión ha caducado. Vuelve a entrar.");
  }

  const { id } = await params;

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return apiError(400, "No se pudo leer el archivo.");
  }

  const file = formData.get("file");
  const kind = String(formData.get("kind") ?? "");
  const operationId = String(formData.get("operationId") ?? "");

  if (!(file instanceof File)) {
    return apiError(400, "Falta el archivo.");
  }

  if (!operationId) {
    return apiError(400, "Falta el identificador de la operación.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await addAttachment(actor, id, {
    kind,
    fileName: file.name,
    mimeType: file.type,
    bytes,
    operationId,
  });

  if (!result.ok) {
    return apiError(result.status, result.error);
  }

  return apiOk({ id: result.value.id });
}
