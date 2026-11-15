"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { WorkOrderStatus } from "@/lib/generated/prisma/client";
import { submit } from "@/lib/offline/submit";

const primaryClass =
  "rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60";

const secondaryClass =
  "rounded-lg border border-neutral-300 px-4 py-2.5 font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-60";

type Location = { latitude: number; longitude: number };

/** Pide la ubicación, pero no bloquea: si el usuario no quiere, se sigue sin ella. */
function getLocation(): Promise<Location | undefined> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(undefined);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(undefined),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 },
    );
  });
}

export function WorkOrderStatusButtons({
  workOrderId,
  status,
  canCancel,
  withLocation,
}: {
  workOrderId: string;
  status: WorkOrderStatus;
  canCancel: boolean;
  withLocation: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<
    { status: "idle" | "saving" } | { status: "error"; error: string } | { status: "queued" }
  >({ status: "idle" });

  async function change(target: WorkOrderStatus) {
    setState({ status: "saving" });

    const location = withLocation ? await getLocation() : undefined;

    const result = await submit({
      url: `/api/partes/${workOrderId}/estado`,
      body: { kind: "json", data: { status: target, location } },
      label: `estado a ${target}`,
    });

    if (result.status === "saved") {
      setState({ status: "idle" });
      router.refresh();
      return;
    }

    if (result.status === "queued") {
      setState({ status: "queued" });
      return;
    }

    setState({ status: "error", error: result.error });
  }

  const busy = state.status === "saving";

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

      {state.status === "queued" ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Guardado en el dispositivo. Se enviará al recuperar la conexión.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === "PENDING" ? (
          <button
            type="button"
            onClick={() => void change("IN_PROGRESS")}
            disabled={busy}
            className={primaryClass}
          >
            {busy ? "Un momento…" : "Empezar el parte"}
          </button>
        ) : null}

        {status === "IN_PROGRESS" ? (
          <button
            type="button"
            onClick={() => void change("COMPLETED")}
            disabled={busy}
            className={primaryClass}
          >
            {busy ? "Un momento…" : "Completar"}
          </button>
        ) : null}

        {canCancel && status !== "COMPLETED" && status !== "CANCELLED" ? (
          <button
            type="button"
            onClick={() => void change("CANCELLED")}
            disabled={busy}
            className={secondaryClass}
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </div>
  );
}
