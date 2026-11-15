"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { newOperationId } from "@/lib/offline/outbox";
import { submit } from "@/lib/offline/submit";

const MAX_SIDE = 1600;
const QUALITY = 0.75;

/**
 * Reduce la foto antes de enviarla: una imagen de móvil sin comprimir son varios
 * megas y, sin cobertura, encolarla sería lento y caro.
 */
async function compress(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    if (typeof bitmap.close === "function") {
      bitmap.close();
    }

    return await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        "image/jpeg",
        QUALITY,
      );
    });
  } catch {
    // Si el navegador no puede decodificar la imagen, se envía tal cual.
    return file;
  }
}

export function PhotoUpload({
  workOrderId,
  disabled,
}: {
  workOrderId: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<
    { status: "idle" | "working" } | { status: "queued" } | { status: "error"; error: string }
  >({ status: "idle" });

  async function handleFile(file: File) {
    setState({ status: "working" });

    const compressed = await compress(file);
    const operationId = newOperationId();

    const result = await submit({
      url: `/api/partes/${workOrderId}/adjuntos`,
      body: {
        kind: "form",
        entries: [
          {
            name: "file",
            value: new File([compressed], "foto.jpg", { type: "image/jpeg" }),
          },
          { name: "kind", value: "PHOTO" },
          { name: "operationId", value: operationId },
        ],
      },
      label: "foto",
    });

    if (result.status === "rejected") {
      setState({ status: "error", error: result.error });
      return;
    }

    setState(
      result.status === "queued" ? { status: "queued" } : { status: "idle" },
    );

    if (result.status === "saved") {
      router.refresh();
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  if (disabled) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {state.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {state.status === "queued" ? (
        <p className="rounded-lg bg-warn/10 px-3 py-2 text-sm text-warn">
          Foto guardada en el dispositivo. Se enviará al recuperar la conexión.
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Añadir foto
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          disabled={state.status === "working"}
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void handleFile(file);
            }
          }}
          className="rounded-lg border border-line px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-white"
        />
      </label>

      {state.status === "working" ? (
        <p className="text-sm text-ink-soft">Preparando la foto…</p>
      ) : null}
    </div>
  );
}
