import { apiError, apiOk, getActor } from "@/lib/api/auth";
import { changeStatus } from "@/lib/work-orders/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();

  if (!actor) {
    return apiError(401, "Tu sesión ha caducado. Vuelve a entrar.");
  }

  const { id } = await params;

  let payload: { status?: unknown; location?: unknown };

  try {
    payload = await request.json();
  } catch {
    return apiError(400, "No se pudo leer lo que se envió.");
  }

  const status = typeof payload.status === "string" ? payload.status : "";
  const result = await changeStatus(actor, id, status, payload.location);

  if (!result.ok) {
    return apiError(result.status, result.error);
  }

  return apiOk({});
}
