import { apiError, apiOk, getActor } from "@/lib/api/auth";
import { saveValues } from "@/lib/work-orders/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getActor();

  if (!actor) {
    return apiError(401, "Tu sesión ha caducado. Vuelve a entrar.");
  }

  const { id } = await params;

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return apiError(400, "No se pudo leer lo que se envió.");
  }

  const values =
    typeof payload === "object" && payload !== null
      ? (payload as { values?: unknown }).values
      : undefined;

  const result = await saveValues(actor, id, values ?? {});

  if (!result.ok) {
    return apiError(result.status, result.error, result.errors);
  }

  return apiOk({});
}
