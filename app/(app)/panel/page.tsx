import type { Metadata } from "next";
import Link from "next/link";

import { AttentionList } from "@/components/dashboard/attention-list";
import { WeeklyChart } from "@/components/dashboard/weekly-chart";
import { requireSession } from "@/lib/auth/guards";
import { countClientsAndProjects } from "@/lib/clients/queries";
import {
  buttonClass,
  Card,
  SectionTitle,
  Stat,
  StatusBadge,
} from "@/components/ui/primitives";
import { getAttention, getWeeklyActivity } from "@/lib/dashboard/queries";
import { workOrderStatusLabel } from "@/lib/domain/work-orders";
import { Role, type WorkOrderStatus } from "@/lib/generated/prisma/client";
import { countWorkOrders, listWorkOrders } from "@/lib/work-orders/queries";

export const metadata: Metadata = {
  title: "Hoy",
};

// Depende de la sesión: se renderiza en cada petición, nunca en el build.
export const instant = false;

const TONE: Record<WorkOrderStatus, "neutral" | "active" | "done" | "danger"> = {
  PENDING: "neutral",
  IN_PROGRESS: "active",
  COMPLETED: "done",
  CANCELLED: "danger",
};

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default async function HomePage() {
  const { user, company } = await requireSession();
  const isOffice = user.role === Role.ADMIN || user.role === Role.MANAGER;

  const viewer = { role: user.role, userId: user.id };

  const [counts, companyTotals, recent, attention, activity] = await Promise.all([
    countWorkOrders(company.id, viewer),
    countClientsAndProjects(company.id),
    listWorkOrders(company.id, viewer),
    getAttention(company.id, viewer),
    getWeeklyActivity(company.id, viewer),
  ]);

  const top = recent.slice(0, 3);
  const open = counts.pending + counts.inProgress;

  return (
    <>
      <header className="flex flex-col gap-1">
        <p className="text-sm text-ink-soft capitalize">
          {dateFormat.format(new Date())}
        </p>
        <h1 className="font-display text-3xl leading-tight font-semibold text-ink">
          Hola, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-ink-soft">
          {open === 0
            ? "No tienes trabajos abiertos."
            : `Tienes ${open} ${open === 1 ? "trabajo abierto" : "trabajos abiertos"}.`}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <SectionTitle>Partes</SectionTitle>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="En curso" value={counts.inProgress} tone="active" />
          <Stat label="Pendientes" value={counts.pending} />
          <Stat label="Completados" value={counts.completed} />
        </div>
      </section>

      {attention.length > 0 ? (
        <section className="flex flex-col gap-3">
          <SectionTitle>Requiere tu atención</SectionTitle>
          <AttentionList items={attention} />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <SectionTitle>Actividad de la semana</SectionTitle>
        <Card className="px-4 py-3">
          <WeeklyChart days={activity} />
        </Card>
      </section>

      {isOffice ? (
        <section className="flex flex-col gap-3">
          <SectionTitle
            action={
              <Link
                href="/clientes"
                className="text-sm font-medium text-brand underline underline-offset-4"
              >
                Ver todos
              </Link>
            }
          >
            Empresa
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Clientes" value={companyTotals.clients} />
            <Stat label="Obras" value={companyTotals.projects} />
          </div>
        </section>
      ) : null}

      <Link
        href="/partes"
        className={buttonClass({ size: "lg", className: "w-full" })}
      >
        {isOffice ? "Ver partes de trabajo" : "Ver mis partes"}
      </Link>

      <section className="flex flex-col gap-3">
        <SectionTitle
          action={
            <Link
              href="/partes"
              className="text-sm font-medium text-brand underline underline-offset-4"
            >
              Todos
            </Link>
          }
        >
          Últimos partes
        </SectionTitle>

        {top.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-ink-soft">
            Todavía no hay partes. Crea el primero desde “Partes”.
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {top.map((workOrder) => (
              <li key={workOrder.id}>
                <Link href={`/partes/${workOrder.id}`} className="block">
                  <Card className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-brand-soft/30">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium text-ink">
                        {workOrder.title}
                      </span>
                      <span className="truncate text-sm text-ink-soft">
                        {workOrder.clientName}
                        {workOrder.assigneeName
                          ? ` · ${workOrder.assigneeName}`
                          : " · sin asignar"}
                      </span>
                    </span>
                    <StatusBadge tone={TONE[workOrder.status]}>
                      {workOrderStatusLabel(workOrder.status)}
                    </StatusBadge>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
