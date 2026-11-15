import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkOrderFields } from "@/components/work-orders/work-order-fields";
import { WorkOrderStatusButtons } from "@/components/work-orders/work-order-status-buttons";
import { requireSession } from "@/lib/auth/guards";
import { workOrderStatusLabel } from "@/lib/domain/work-orders";
import { Role, type WorkOrderStatus } from "@/lib/generated/prisma/client";
import { getWorkOrder } from "@/lib/work-orders/queries";

export const metadata: Metadata = {
  title: "Parte",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const badgeClass: Record<WorkOrderStatus, string> = {
  PENDING: "bg-neutral-100 text-neutral-700",
  IN_PROGRESS: "bg-emerald-100 text-emerald-900",
  COMPLETED: "bg-emerald-800 text-white",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function WorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireSession();
  const { id } = await params;

  const viewer = { role: auth.user.role, userId: auth.user.id };
  const workOrder = await getWorkOrder(auth.company.id, id, viewer);

  if (!workOrder) {
    notFound();
  }

  const isOffice =
    auth.user.role === Role.ADMIN || auth.user.role === Role.MANAGER;
  const isClosed =
    workOrder.status === "COMPLETED" || workOrder.status === "CANCELLED";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          {auth.company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {workOrder.title}
        </h1>

        <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-medium ${badgeClass[workOrder.status]}`}
          >
            {workOrderStatusLabel(workOrder.status)}
          </span>
          <span>
            {workOrder.clientName}
            {workOrder.projectName ? ` · ${workOrder.projectName}` : ""}
          </span>
        </p>

        <dl className="flex flex-col gap-0.5 text-sm text-neutral-600">
          {workOrder.clientAddress ? (
            <div className="flex gap-1">
              <dt className="sr-only">Dirección</dt>
              <dd>{workOrder.clientAddress}</dd>
            </div>
          ) : null}
          <div className="flex gap-1">
            <dt className="text-neutral-500">Asignado a</dt>
            <dd>{workOrder.assigneeName ?? "nadie"}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-neutral-500">Plantilla</dt>
            <dd>{workOrder.templateName ?? "sin plantilla"}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-neutral-500">Creado</dt>
            <dd>{dateFormat.format(workOrder.createdAt)}</dd>
          </div>
          {workOrder.completedAt ? (
            <div className="flex gap-1">
              <dt className="text-neutral-500">Completado</dt>
              <dd>{dateFormat.format(workOrder.completedAt)}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      {isClosed ? (
        <p className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-700">
          Este parte está cerrado y no se puede modificar.
        </p>
      ) : (
        <WorkOrderStatusButtons
          workOrderId={workOrder.id}
          status={workOrder.status}
          canCancel={isOffice}
        />
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
          Campos del parte
        </h2>
        <WorkOrderFields
          workOrderId={workOrder.id}
          fields={workOrder.fields}
          values={workOrder.values}
          readOnly={isClosed}
        />
      </section>

      <Link
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/partes"
      >
        Volver a partes
      </Link>
    </main>
  );
}
