import { updateProjectStatus } from "@/lib/clients/actions";
import { PROJECT_STATUSES, projectStatusLabel } from "@/lib/domain/projects";
import type { ProjectStatus } from "@/lib/generated/prisma/client";

/**
 * Cambio de estado de una obra con tres botones.
 *
 * Deliberadamente sin desplegable ni JavaScript: en obra se toca una vez y ya
 * está. El estado actual aparece marcado y deshabilitado, así que no se puede
 * reenviar el mismo valor.
 */
export function ProjectStatusForm({
  projectId,
  status,
}: {
  projectId: string;
  status: ProjectStatus;
}) {
  return (
    <form action={updateProjectStatus} className="flex flex-wrap gap-1.5">
      <input type="hidden" name="projectId" value={projectId} />

      {PROJECT_STATUSES.map((value) => {
        const isCurrent = value === status;

        return (
          <button
            key={value}
            type="submit"
            name="status"
            value={value}
            disabled={isCurrent}
            aria-current={isCurrent ? "true" : undefined}
            className={
              isCurrent
                ? "rounded-control border border-brand bg-brand px-2.5 py-1 text-xs font-medium text-paper"
                : "rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink transition hover:bg-line/50"
            }
          >
            {projectStatusLabel(value)}
          </button>
        );
      })}
    </form>
  );
}
