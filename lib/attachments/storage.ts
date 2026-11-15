import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Almacenamiento de adjuntos en disco local.
 *
 * Es el único sitio que conoce dónde viven los archivos: pasar a Cloudflare R2
 * es reimplementar estas cuatro funciones, no tocar la aplicación.
 */
const ROOT = path.join(process.cwd(), "data", "attachments");

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extensionForMime(mimeType: string): string | null {
  return EXTENSION_BY_MIME[mimeType] ?? null;
}

/**
 * Clave estable a partir del identificador de operación que genera el cliente.
 * sirve de idempotencia: si llega dos veces la misma foto, la clave coincide.
 */
export function buildStorageKey(
  companyId: string,
  workOrderId: string,
  operationId: string,
  extension: string,
): string {
  const safe = operationId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 48);

  return `${companyId}/${workOrderId}/${safe}.${extension}`;
}

/** Evita que una clave manipulada salga de la carpeta de adjuntos. */
function resolveKey(storageKey: string): string {
  const full = path.resolve(ROOT, storageKey);
  const root = path.resolve(ROOT);

  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error("Ruta de adjunto no válida");
  }

  return full;
}

export async function writeAttachmentFile(
  storageKey: string,
  bytes: Buffer,
): Promise<void> {
  const full = resolveKey(storageKey);

  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
}

export async function readAttachmentFile(storageKey: string): Promise<Buffer> {
  return readFile(resolveKey(storageKey));
}

export async function deleteAttachmentFile(storageKey: string): Promise<void> {
  try {
    await unlink(resolveKey(storageKey));
  } catch {
    // Si el archivo ya no está, el registro se borra igual.
  }
}
