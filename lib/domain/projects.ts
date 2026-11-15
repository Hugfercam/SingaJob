import type { ProjectStatus } from "@/lib/generated/prisma/client";

export const PROJECT_STATUSES = ["ACTIVE", "PAUSED", "FINISHED"] as const;

const LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "En curso",
  PAUSED: "En pausa",
  FINISHED: "Terminada",
};

export function projectStatusLabel(status: ProjectStatus): string {
  return LABELS[status];
}

/** Valida un estado recibido de un formulario antes de tocar la base. */
export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}
