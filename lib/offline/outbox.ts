/**
 * Cola de operaciones pendientes en IndexedDB.
 *
 * Se guarda **antes** de intentar la red. Si el envío falla, el trabajo no se
 * pierde; si funciona, se borra. Los cuerpos con archivos se guardan como
 * `Blob`, que IndexedDB soporta de forma nativa.
 */

const DB_NAME = "signajob-offline";
const STORE = "outbox";
const VERSION = 1;

export type QueuedBody =
  | { kind: "json"; data: unknown }
  | { kind: "form"; entries: { name: string; value: string | Blob }[] };

export type QueuedOperation = {
  id: string;
  url: string;
  method: "POST" | "DELETE";
  body: QueuedBody | null;
  createdAt: number;
  label: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Este navegador no soporta IndexedDB."));
      return;
    }

    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueue(operation: QueuedOperation): Promise<void> {
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(operation);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("signajob:outbox"));
  }
}

export async function listQueue(): Promise<QueuedOperation[]> {
  const db = await openDb();

  const items = await new Promise<QueuedOperation[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result as QueuedOperation[]);
    request.onerror = () => reject(request.error);
  });

  db.close();

  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("signajob:outbox"));
  }
}

export async function queueSize(): Promise<number> {
  try {
    return (await listQueue()).length;
  } catch {
    return 0;
  }
}

export function newOperationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `op_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}
