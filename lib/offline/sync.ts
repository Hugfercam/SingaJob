import { buildBody, contentTypeFor } from "./body";
import {
  listQueue,
  removeFromQueue,
  type QueuedOperation,
} from "./outbox";

export type FlushResult = { sent: number; remaining: number };

let flushing = false;

async function performRequest(operation: QueuedOperation): Promise<Response> {
  return fetch(operation.url, {
    method: operation.method,
    body: buildBody(operation.body),
    headers: contentTypeFor(operation.body)
      ? { "Content-Type": "application/json" }
      : undefined,
    credentials: "same-origin",
  });
}

/**
 * Reproduce la cola en orden.
 *
 * - Si la red falla, se detiene y se reintenta más tarde (no se pierde nada).
 * - Si el servidor responde 4xx, la operación se descarta: reintentarla no
 *   arreglaría nada (por ejemplo, un parte ya cerrado) y bloquearía la cola.
 * - Si responde 5xx, se detiene para reintentar cuando el servidor se recupere.
 */
export async function flushQueue(): Promise<FlushResult> {
  if (flushing) {
    return { sent: 0, remaining: 0 };
  }

  flushing = true;

  let sent = 0;

  try {
    const operations = await listQueue();

    for (const operation of operations) {
      let response: Response;

      try {
        response = await performRequest(operation);
      } catch {
        break;
      }

      if (response.ok) {
        await removeFromQueue(operation.id);
        sent += 1;
        continue;
      }

      if (response.status >= 400 && response.status < 500) {
        const detail = await response
          .json()
          .catch(() => ({ error: "rechazado" }));
        console.warn("Operación descartada por el servidor", {
          url: operation.url,
          status: response.status,
          detail,
        });
        await removeFromQueue(operation.id);
        continue;
      }

      break;
    }

    const remaining = (await listQueue()).length;

    return { sent, remaining };
  } finally {
    flushing = false;
  }
}
