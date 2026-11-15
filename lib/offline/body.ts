import type { QueuedBody } from "./outbox";

/** Convierte el cuerpo guardado en la cola al que espera `fetch`. */
export function buildBody(body: QueuedBody | null): BodyInit | undefined {
  if (!body) {
    return undefined;
  }

  if (body.kind === "json") {
    return JSON.stringify(body.data);
  }

  const formData = new FormData();

  for (const entry of body.entries) {
    formData.append(entry.name, entry.value);
  }

  return formData;
}

export function contentTypeFor(body: QueuedBody | null): string | undefined {
  return body?.kind === "json" ? "application/json" : undefined;
}
