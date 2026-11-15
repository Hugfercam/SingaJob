"use client";

import { useState } from "react";

/**
 * Descargar y compartir el albarán.
 *
 * En el móvil se usa el menú del sistema (Web Share), que es como el técnico
 * manda el PDF por WhatsApp. Si el navegador no lo soporta, se descarga.
 */
export function PdfActions({
  workOrderId,
  title,
  disabled,
}: {
  workOrderId: string;
  title: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<
    { status: "idle" } | { status: "working" } | { status: "error"; error: string }
  >({ status: "idle" });

  async function share() {
    setState({ status: "working" });

    try {
      const response = await fetch(`/api/partes/${workOrderId}/pdf`);

      if (!response.ok) {
        setState({ status: "error", error: "No se pudo generar el PDF." });
        return;
      }

      const blob = await response.blob();
      const file = new File([blob], "albaran.pdf", { type: "application/pdf" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title });
        setState({ status: "idle" });
        return;
      }

      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setState({ status: "idle" });
    } catch {
      setState({ status: "error", error: "No se pudo compartir el PDF." });
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
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/partes/${workOrderId}/pdf`}
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
        >
          Descargar albarán (PDF)
        </a>
        <button
          type="button"
          onClick={() => void share()}
          disabled={state.status === "working"}
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-60"
        >
          {state.status === "working" ? "Preparando…" : "Compartir"}
        </button>
      </div>
    </div>
  );
}
