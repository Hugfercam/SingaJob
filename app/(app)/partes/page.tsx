import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/auth/guards";
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

const badgeClass: Record<WorkOrderStatus, string> = {
  PENDING: "bg-neutral-100 text-neutral-700",
  IN_PROGRESS: "bg-emerald-100 text-emerald-900",
  COMPLETED: "bg-emerald-800 text-white",
  CANCELLED: "bg-red-100 text-red-800",
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
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          {auth.company.name}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {isOffice ? "Partes de trabajo" : "Mis partes"}
        </h1>
        <p className="text-sm text-neutral-600">
          {workOrders.length}{" "}
          {workOrders.length === 1 ? "parte" : "partes"}
          {status ? ` en estado «${workOrderStatusLabel(status).toLowerCase()}»` : ""}.
        </p>
      </header>

      {isOffice ? (
        <Link
          className="rounded-lg bg-emerald-800 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-900"
          href="/partes/nuevo"
        >
          Nuevo parte
        </Link>
      ) : null}

      <nav className="flex flex-wrap gap-1.5" aria-label="Filtrar por estado">
        <Link
          href="/partes"
          className={
            status
              ? "rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700"
              : "rounded-lg border border-emerald-800 bg-emerald-800 px-2.5 py-1 text-xs font-medium text-white"
          }
        >
          Todos
        </Link>
        {WORK_ORDER_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/partes?estado=${value}`}
            className={
              status === value
                ? "rounded-lg border border-emerald-800 bg-emerald-800 px-2.5 py-1 text-xs font-medium text-white"
                : "rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700"
            }
          >
            {workOrderStatusLabel(value)}
          </Link>
        ))}
      </nav>

      {workOrders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600">
          {isOffice
            ? "No hay partes con este filtro. Crea el primero."
            : "No tienes partes asignados todavía."}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {workOrders.map((workOrder) => (
            <li key={workOrder.id}>
              <Link
                className="flex flex-col gap-1 px-4 py-3 transition hover:bg-neutral-50"
                href={`/partes/${workOrder.id}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-neutral-900">
                    {workOrder.title}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${badgeClass[workOrder.status]}`}
                  >
                    {workOrderStatusLabel(workOrder.status)}
                  </span>
                </span>
                <span className="text-sm text-neutral-600">
                  {workOrder.clientName}
                  {workOrder.projectName ? ` · ${workOrder.projectName}` : ""}
                  {workOrder.assigneeName
                    ? ` · ${workOrder.assigneeName}`
                    : " · sin asignar"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/panel"
      >
        Volver al panel
      </Link>
    </main>
  );
}
