import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import { Role } from "@/lib/generated/prisma/client";

import { viewerFilter, type WorkOrderViewer } from "@/lib/work-orders/queries";

const STALLED_HOURS = 48;
const DAY_MS = 24 * 60 * 60 * 1000;

export type AttentionItem = {
  kind: "unassigned" | "stalled" | "unsigned";
  title: string;
  detail: string;
  count: number;
  href: string;
};

/**
 * Avisos que se resuelven en un toque.
 *
 * Solo aparecen si hay algo que hacer y siempre llevan a la pantalla donde se
 * arregla: un aviso que no se puede resolver es ruido.
 */
export async function getAttention(
  companyId: string,
  viewer: WorkOrderViewer,
): Promise<AttentionItem[]> {
  const prisma = getPrisma();
  const isOffice = viewer.role === Role.ADMIN || viewer.role === Role.MANAGER;
  const scope = { ...tenantScope(companyId), ...viewerFilter(viewer) };

  const stalledBefore = new Date(Date.now() - STALLED_HOURS * 60 * 60 * 1000);

  const [unassigned, stalled, unsigned] = await Promise.all([
    isOffice
      ? prisma.workOrder.count({
          where: {
            ...tenantScope(companyId),
            status: "PENDING",
            assignedToId: null,
          },
        })
      : Promise.resolve(0),
    prisma.workOrder.count({
      where: { ...scope, status: "IN_PROGRESS", startedAt: { lt: stalledBefore } },
    }),
    prisma.workOrder.count({
      where: {
        ...scope,
        status: "COMPLETED",
        attachments: { none: { kind: "SIGNATURE_CLIENT" } },
      },
    }),
  ]);

  const items: AttentionItem[] = [];

  if (unassigned > 0) {
    items.push({
      kind: "unassigned",
      title: "Partes sin asignar",
      detail: "Nadie los ha cogido todavía.",
      count: unassigned,
      href: "/partes?estado=PENDING",
    });
  }

  if (stalled > 0) {
    items.push({
      kind: "stalled",
      title: "Partes parados",
      detail: `En curso desde hace más de ${STALLED_HOURS} horas.`,
      count: stalled,
      href: "/partes?estado=IN_PROGRESS",
    });
  }

  if (unsigned > 0) {
    items.push({
      kind: "unsigned",
      title: "Completados sin firma",
      detail: "Sin la firma del cliente no hay prueba del trabajo.",
      count: unsigned,
      href: "/partes?estado=COMPLETED",
    });
  }

  return items;
}

export type ActivityDay = {
  label: string;
  iso: string;
  completed: number;
};

/** Partes completados en los últimos siete días, uno por día. */
export async function getWeeklyActivity(
  companyId: string,
  viewer: WorkOrderViewer,
): Promise<ActivityDay[]> {
  const today = new Date();
  const start = new Date(today.getTime() - 6 * DAY_MS);
  start.setHours(0, 0, 0, 0);

  const rows = await getPrisma().workOrder.findMany({
    where: {
      ...tenantScope(companyId),
      ...viewerFilter(viewer),
      status: "COMPLETED",
      completedAt: { gte: start },
    },
    select: { completedAt: true },
  });

  const labels = ["L", "M", "X", "J", "V", "S", "D"];
  const days: ActivityDay[] = [];

  for (let index = 0; index < 7; index += 1) {
    const date = new Date(start.getTime() + index * DAY_MS);
    const iso = date.toISOString().slice(0, 10);

    days.push({
      label: labels[(date.getDay() + 6) % 7] ?? "",
      iso,
      completed: 0,
    });
  }

  for (const row of rows) {
    if (!row.completedAt) {
      continue;
    }

    const iso = row.completedAt.toISOString().slice(0, 10);
    const day = days.find((candidate) => candidate.iso === iso);

    if (day) {
      day.completed += 1;
    }
  }

  return days;
}
