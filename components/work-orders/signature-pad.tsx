"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AttachmentKind } from "@/lib/generated/prisma/client";
import { newOperationId } from "@/lib/offline/outbox";
import { submit } from "@/lib/offline/submit";

const WIDTH = 600;
const HEIGHT = 200;

/**
 * Firma a mano en pantalla.
 *
 * El PNG se genera en el propio canvas y se envía como un adjunto más, así que
 * también funciona sin conexión: se guarda como `Blob` en la cola.
 */
export function SignaturePad({
  workOrderId,
  kind,
  title,
}: {
  workOrderId: string;
  kind: AttachmentKind;
  title: string;
}) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "saving" }
    | { status: "queued" }
    | { status: "error"; error: string }
  >({ status: "idle" });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    canvas.width = WIDTH * ratio;
    canvas.height = HEIGHT * ratio;

    const context = canvas.getContext("2d");

    if (context) {
      context.scale(ratio, ratio);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, WIDTH, HEIGHT);
      context.lineWidth = 2.2;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#111111";
    }
  }, []);

  const point = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  }, []);

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;

    const context = canvasRef.current?.getContext("2d");
    const { x, y } = point(event);

    context?.beginPath();
    context?.moveTo(x, y);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) {
      return;
    }

    const context = canvasRef.current?.getContext("2d");
    const { x, y } = point(event);

    context?.lineTo(x, y);
    context?.stroke();
    setHasInk(true);
  }

  function end() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    setHasInk(false);
  }

  async function save() {
    const canvas = canvasRef.current;

    if (!canvas || !hasInk) {
      setState({ status: "error", error: "La firma está vacía." });
      return;
    }

    setState({ status: "saving" });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((value) => resolve(value), "image/png");
    });

    if (!blob) {
      setState({ status: "error", error: "No se pudo preparar la firma." });
      return;
    }

    const result = await submit({
      url: `/api/partes/${workOrderId}/adjuntos`,
      body: {
        kind: "form",
        entries: [
          {
            name: "file",
            value: new File([blob], "firma.png", { type: "image/png" }),
          },
          { name: "kind", value: kind },
          { name: "operationId", value: newOperationId() },
        ],
      },
      label: title.toLowerCase(),
    });

    if (result.status === "rejected") {
      setState({ status: "error", error: result.error });
      return;
    }

    if (result.status === "queued") {
      setState({ status: "queued" });
      return;
    }

    setState({ status: "idle" });
    clear();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-ink">{title}</p>

      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        aria-label={title}
        className="h-[200px] w-full touch-none rounded-lg border border-line bg-surface"
      />

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
          Firma guardada en el dispositivo. Se enviará al recuperar la conexión.
        </p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={state.status === "saving" || !hasInk}
          className="tap inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
        >
          {state.status === "saving" ? "Guardando…" : "Guardar firma"}
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-line/50"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
