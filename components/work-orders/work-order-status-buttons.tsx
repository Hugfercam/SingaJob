"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/primitives";
import type { WorkOrderStatus } from "@/lib/generated/prisma/client";
import { submit } from "@/lib/offline/submit";

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
          className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {state.status === "queued" ? (
        <p className="rounded-control bg-warn/10 px-3 py-2 text-sm text-warn">
          Guardado en el dispositivo. Se enviará al recuperar la conexión.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {status === "PENDING" ? (
          <Button
            type="button"
            size="lg"
            onClick={() => void change("IN_PROGRESS")}
            disabled={busy}
          >
            {busy ? "Un momento…" : "Empezar el parte"}
          </Button>
        ) : null}

        {status === "IN_PROGRESS" ? (
          <Button
            type="button"
            size="lg"
            onClick={() => void change("COMPLETED")}
            disabled={busy}
          >
            {busy ? "Un momento…" : "Completar"}
          </Button>
        ) : null}

        {canCancel && status !== "COMPLETED" && status !== "CANCELLED" ? (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => void change("CANCELLED")}
            disabled={busy}
          >
            Cancelar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
