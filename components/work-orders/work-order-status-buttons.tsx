"use client";

import { useActionState } from "react";

import {
  changeWorkOrderStatus,
  type StatusState,
} from "@/lib/work-orders/actions";
import type { WorkOrderStatus } from "@/lib/generated/prisma/client";

const primaryClass =
  "rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60";

const secondaryClass =
  "rounded-lg border border-neutral-300 px-4 py-2.5 font-medium text-neutral-800 transition hover:bg-neutral-100 disabled:opacity-60";

export function WorkOrderStatusButtons({
  workOrderId,
  status,
  canCancel,
}: {
  workOrderId: string;
  status: WorkOrderStatus;
  canCancel: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    changeWorkOrderStatus,
    null as StatusState,
  );

  return (
    <div className="flex flex-col gap-2">
      {state?.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="flex flex-wrap gap-2">
        <input type="hidden" name="workOrderId" value={workOrderId} />

        {status === "PENDING" ? (
          <button
            type="submit"
            name="status"
            value="IN_PROGRESS"
            disabled={pending}
            className={primaryClass}
          >
            {pending ? "Un momento…" : "Empezar el parte"}
          </button>
        ) : null}

        {status === "IN_PROGRESS" ? (
          <button
            type="submit"
            name="status"
            value="COMPLETED"
            disabled={pending}
            className={primaryClass}
          >
            {pending ? "Un momento…" : "Completar"}
          </button>
        ) : null}

        {canCancel && status !== "COMPLETED" && status !== "CANCELLED" ? (
          <button
            type="submit"
            name="status"
            value="CANCELLED"
            disabled={pending}
            className={secondaryClass}
          >
            Cancelar
          </button>
        ) : null}
      </form>
    </div>
  );
}
