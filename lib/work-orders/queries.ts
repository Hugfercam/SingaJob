import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import { Role, type WorkOrderStatus } from "@/lib/generated/prisma/client";
import {
  readFieldDefinitions,
  type FieldDefinition,
  type WorkOrderValues,
} from "@/lib/work-orders/fields";

export type WorkOrderViewer = { role: Role; userId: string };

/**
 * Un técnico solo ve lo que tiene asignado. La oficina ve todo lo de su empresa.
 * Este filtro se usa tanto en lectura como en escritura.
 */
export function viewerFilter(viewer: WorkOrderViewer) {
  return viewer.role === Role.TECHNICIAN
    ? { assignedToId: viewer.userId }
    : {};
}

export type WorkOrderListItem = {
  id: string;
  title: string;
  status: WorkOrderStatus;
  clientName: string;
  projectName: string | null;
  assigneeName: string | null;
  createdAt: Date;
};

export async function listWorkOrders(
  companyId: string,
  viewer: WorkOrderViewer,
  status?: WorkOrderStatus,
): Promise<WorkOrderListItem[]> {
  const rows = await getPrisma().workOrder.findMany({
    where: {
      ...tenantScope(companyId),
      ...viewerFilter(viewer),
      ...(status ? { status } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      client: { select: { name: true } },
      project: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    clientName: row.client.name,
    projectName: row.project?.name ?? null,
    assigneeName: row.assignedTo?.name ?? null,
    createdAt: row.createdAt,
  }));
}

export type WorkOrderDetail = {
  id: string;
  title: string;
  status: WorkOrderStatus;
  fields: FieldDefinition[];
  values: WorkOrderValues;
  clientId: string;
  clientName: string;
  clientAddress: string | null;
  projectName: string | null;
  templateName: string | null;
  assigneeName: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};

export async function getWorkOrder(
  companyId: string,
  workOrderId: string,
  viewer: WorkOrderViewer,
): Promise<WorkOrderDetail | null> {
  const workOrder = await getPrisma().workOrder.findFirst({
    where: {
      id: workOrderId,
      ...tenantScope(companyId),
      ...viewerFilter(viewer),
    },
    select: {
      id: true,
      title: true,
      status: true,
      fieldsSnapshot: true,
      values: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      client: { select: { id: true, name: true, address: true } },
      project: { select: { name: true } },
      template: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
  });

  if (!workOrder) {
    return null;
  }

  return {
    id: workOrder.id,
    title: workOrder.title,
    status: workOrder.status,
    fields: readFieldDefinitions(workOrder.fieldsSnapshot),
    values:
      typeof workOrder.values === "object" && workOrder.values !== null
        ? (workOrder.values as WorkOrderValues)
        : {},
    clientId: workOrder.client.id,
    clientName: workOrder.client.name,
    clientAddress: workOrder.client.address,
    projectName: workOrder.project?.name ?? null,
    templateName: workOrder.template?.name ?? null,
    assigneeName: workOrder.assignedTo?.name ?? null,
    startedAt: workOrder.startedAt,
    completedAt: workOrder.completedAt,
    createdAt: workOrder.createdAt,
  };
}

export type WorkOrderCounts = {
  pending: number;
  inProgress: number;
  completed: number;
};

export async function countWorkOrders(
  companyId: string,
  viewer: WorkOrderViewer,
): Promise<WorkOrderCounts> {
  const base = {
    ...tenantScope(companyId),
    ...viewerFilter(viewer),
  };

  const prisma = getPrisma();

  const [pending, inProgress, completed] = await Promise.all([
    prisma.workOrder.count({ where: { ...base, status: "PENDING" } }),
    prisma.workOrder.count({ where: { ...base, status: "IN_PROGRESS" } }),
    prisma.workOrder.count({ where: { ...base, status: "COMPLETED" } }),
  ]);

  return { pending, inProgress, completed };
}

/** Técnicos activos de la empresa, para asignar un parte. */
export async function listAssignableUsers(companyId: string) {
  return getPrisma().user.findMany({
    where: { ...tenantScope(companyId), active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });
}
