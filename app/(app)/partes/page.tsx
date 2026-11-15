import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/auth/guards";
import {
  buttonClass,
  Card,
  EmptyState,
  StatusBadge,
} from "@/components/ui/primitives";
import {
  WORK_ORDER_STATUSES,
  isWorkOrderStatus,
  workOrderStatusLabel,
} from "@/lib/domain/work-orders";
import { Role, type WorkOrderStatus } from "@/lib/generated/prisma/client";
import { listWorkOrders } from "@/lib/work-orders/queries";

export const metadata: Metadata = {
  title: "Partes",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

const TONE: Record<WorkOrderStatus, "neutral" | "active" | "done" | "danger"> = {
  PENDING: "neutral",
  IN_PROGRESS: "active",
  COMPLETED: "done",
  CANCELLED: "danger",
};

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const auth = await requireSession();
  const params = await searchParams;
  const rawStatus = typeof params.estado === "string" ? params.estado : "";
  const status = isWorkOrderStatus(rawStatus) ? rawStatus : undefined;

  const viewer = { role: auth.user.role, userId: auth.user.id };
  const workOrders = await listWorkOrders(auth.company.id, viewer, status);
  const isOffice =
    auth.user.role === Role.ADMIN || auth.user.role === Role.MANAGER;

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl leading-tight font-semibold text-ink">
          {isOffice ? "Partes" : "Mis partes"}
        </h1>
        <p className="text-sm text-ink-soft">
          {workOrders.length} {workOrders.length === 1 ? "parte" : "partes"}
          {status
            ? ` en estado «${workOrderStatusLabel(status).toLowerCase()}»`
            : ""}
          .
        </p>
      </header>

      {isOffice ? (
        <Link
          href="/partes/nuevo"
          className={buttonClass({ size: "lg", className: "w-full" })}
        >
          Nuevo parte
        </Link>
      ) : null}

      <nav
        aria-label="Filtrar por estado"
        className="chips -mx-1 flex flex-wrap gap-1.5 px-1"
      >
        <Link
          href="/partes"
          aria-current={status ? undefined : "page"}
          className={chipClass(!status)}
        >
          Todos
        </Link>
        {WORK_ORDER_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/partes?estado=${value}`}
            aria-current={status === value ? "page" : undefined}
            className={chipClass(status === value)}
          >
            {workOrderStatusLabel(value)}
          </Link>
        ))}
      </nav>

      {workOrders.length === 0 ? (
        <EmptyState
          title={
            isOffice ? "No hay partes con este filtro" : "No tienes partes aún"
          }
          description={
            isOffice
              ? "Crea un parte o prueba otro filtro."
              : "Cuando te asignen un trabajo aparecerá aquí."
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {workOrders.map((workOrder) => (
            <li key={workOrder.id}>
              <Link href={`/partes/${workOrder.id}`} className="block">
                <Card className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-brand-soft/30">
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-medium text-ink">
                      {workOrder.title}
                    </span>
                    <StatusBadge tone={TONE[workOrder.status]}>
                      {workOrderStatusLabel(workOrder.status)}
                    </StatusBadge>
                  </span>
                  <span className="text-sm text-ink-soft">
                    {workOrder.clientName}
                    {workOrder.projectName ? ` · ${workOrder.projectName}` : ""}
                    {workOrder.assigneeName
                      ? ` · ${workOrder.assigneeName}`
                      : " · sin asignar"}
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function chipClass(active: boolean) {
  return [
    "tap inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
    active
      ? "border-brand bg-brand text-paper"
      : "border-line bg-surface text-ink-soft hover:bg-brand-soft/40",
  ].join(" ");
}
