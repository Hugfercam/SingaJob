import type { WorkOrderStatus } from "@/lib/generated/prisma/client";

export const WORK_ORDER_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;

const LABELS: Record<WorkOrderStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export function workOrderStatusLabel(status: WorkOrderStatus): string {
  return LABELS[status];
}

export function isWorkOrderStatus(value: string): value is WorkOrderStatus {
  return (WORK_ORDER_STATUSES as readonly string[]).includes(value);
}

/**
 * Estados que el técnico puede poner por sí mismo. Cancelar es cosa de la
 * oficina: implica dejar el trabajo sin hacer y a veces con material gastado.
 */
export const TECHNICIAN_ALLOWED_STATUSES: readonly WorkOrderStatus[] = [
  "IN_PROGRESS",
  "COMPLETED",
];
