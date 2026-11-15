import { buildBody, contentTypeFor } from "./body";
import { enqueue, newOperationId, type QueuedBody } from "./outbox";

export type SubmitResult =
  | { status: "saved" }
  | { status: "queued" }
  | { status: "rejected"; error: string; errors?: Record<string, string> };

type SubmitInput = {
  url: string;
  method?: "POST" | "DELETE";
  body?: QueuedBody | null;
  label: string;
};

async function queue(input: SubmitInput): Promise<SubmitResult> {
  await enqueue({
    id: newOperationId(),
    url: input.url,
    method: input.method ?? "POST",
    body: input.body ?? null,
    createdAt: Date.now(),
    label: input.label,
  });

  return { status: "queued" };
}

/**
 * Envía una operación del parte.
 *
 * Si no hay red —o el servidor no responde— se guarda en la cola y se devuelve
 * `queued`, para que la interfaz diga la verdad: el trabajo está a salvo en el
 * dispositivo, pero todavía no en el servidor.
 */
export async function submit(input: SubmitInput): Promise<SubmitResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return queue(input);
  }

  try {
    const response = await fetch(input.url, {
      method: input.method ?? "POST",
      body: buildBody(input.body ?? null),
      headers: contentTypeFor(input.body ?? null)
        ? { "Content-Type": "application/json" }
        : undefined,
      credentials: "same-origin",
    });

    if (response.ok) {
      return { status: "saved" };
    }

    // 5xx es problema del servidor: se reintenta más tarde.
    if (response.status >= 500) {
      return queue(input);
    }

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      errors?: Record<string, string>;
    };

    return {
      status: "rejected",
      error: payload.error ?? "No se pudo guardar.",
      errors: payload.errors,
    };
  } catch {
    return queue(input);
  }
}
