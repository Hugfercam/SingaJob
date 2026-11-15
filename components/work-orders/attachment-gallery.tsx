"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { submit } from "@/lib/offline/submit";
import type { WorkOrderAttachment } from "@/lib/work-orders/queries";

/**
 * Galería de fotos y firmas.
 *
 * Las firmas se muestran pero no se borran: son la prueba del cierre.
 */
export function AttachmentGallery({
  workOrderId,
  attachments,
}: {
  workOrderId: string;
  attachments: WorkOrderAttachment[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const photos = attachments.filter((item) => item.kind === "PHOTO");
  const signatures = attachments.filter((item) => item.kind !== "PHOTO");

  async function remove(id: string) {
    setRemoving(id);
    setError(null);

    const result = await submit({
      url: `/api/partes/${workOrderId}/adjuntos/${id}`,
      method: "DELETE",
      label: "borrar foto",
    });

    setRemoving(null);

    if (result.status === "saved") {
      router.refresh();
      return;
    }

    if (result.status === "queued") {
      setError("Se borrará cuando vuelva la conexión.");
      return;
    }

    setError(result.error);
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <li key={photo.id} className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/adjuntos/${photo.id}`}
                alt={photo.fileName}
                className="h-32 w-full rounded-lg border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => void remove(photo.id)}
                disabled={removing === photo.id}
                className="text-xs font-medium text-danger underline underline-offset-2 disabled:opacity-50"
              >
                {removing === photo.id ? "Borrando…" : "Borrar foto"}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {signatures.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {signatures.map((signature) => (
            <li key={signature.id} className="flex flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/adjuntos/${signature.id}`}
                alt={signature.fileName}
                className="h-24 w-full rounded-lg border border-line bg-surface object-contain"
              />
              <span className="text-xs text-ink-soft">
                {signature.kind === "SIGNATURE_CLIENT"
                  ? "Firma del cliente"
                  : "Firma del técnico"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
