import type { WorkOrderStatus } from "@/lib/generated/prisma/client";

const STEPS = ["Pendiente", "En curso", "Completado"] as const;

const PATH =
  "M14 14C50 8 88 20 128 13s64-6 96 1";

/**
 * Progreso del parte con el trazo de firma.
 *
 * Es el único sitio del producto donde el trazo informa: se dibuja a medida que
 * el parte avanza y, al completarse, queda entero.
 */
export function StatusTrail({ status }: { status: WorkOrderStatus }) {
  const index =
    status === "PENDING" ? 0 : status === "IN_PROGRESS" ? 1 : status === "COMPLETED" ? 2 : 2;
  const progress = status === "CANCELLED" ? 0 : (index / (STEPS.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox="0 0 240 26"
        role="img"
        aria-label={`Estado del parte: ${STEPS[index]}`}
        className="h-8 w-full"
      >
        <path
          d={PATH}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          pathLength={100}
          className="stroke-line"
        />
        <path
          d={PATH}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${progress} 100`}
          className={status === "CANCELLED" ? "stroke-danger" : "stroke-accent"}
        />

        {STEPS.map((step, stepIndex) => {
          const x = [14, 128, 224][stepIndex] ?? 14;
          const reached = stepIndex <= index && status !== "CANCELLED";

          return (
            <circle
              key={step}
              cx={x}
              cy={stepIndex === 1 ? 13 : 14}
              r={4.5}
              className={reached ? "fill-accent" : "fill-surface"}
              strokeWidth={2}
              stroke={reached ? "var(--color-accent)" : "var(--color-line)"}
            />
          );
        })}
      </svg>

      <div className="flex justify-between text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
        {STEPS.map((step, stepIndex) => (
          <span
            key={step}
            className={
              stepIndex === index && status !== "CANCELLED"
                ? "text-brand"
                : stepIndex <= index && status !== "CANCELLED"
                  ? "text-ink"
                  : ""
            }
          >
            {step}
          </span>
        ))}
      </div>
    </div>
  );
}
