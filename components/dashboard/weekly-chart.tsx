import type { ActivityDay } from "@/lib/dashboard/queries";

const WIDTH = 320;
const HEIGHT = 96;
const BAR_GAP = 10;

/**
 * Actividad de la semana en SVG a mano: sin librerías, sin JavaScript en el
 * cliente y con los datos también en texto para lectores de pantalla.
 */
export function WeeklyChart({ days }: { days: ActivityDay[] }) {
  const total = days.reduce((sum, day) => sum + day.completed, 0);
  const max = Math.max(1, ...days.map((day) => day.completed));
  const slot = (WIDTH - BAR_GAP * (days.length - 1)) / days.length;

  const summary = days
    .map((day) => `${day.label}: ${day.completed}`)
    .join(", ");

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm text-ink-soft">
        {total === 0
          ? "Sin partes completados esta semana."
          : `${total} ${total === 1 ? "parte completado" : "partes completados"} en los últimos 7 días.`}
      </figcaption>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 18}`}
        role="img"
        aria-label={`Partes completados por día. ${summary}`}
        className="h-28 w-full"
      >
        {days.map((day, index) => {
          const height = day.completed === 0 ? 2 : (day.completed / max) * HEIGHT;
          const x = index * (slot + BAR_GAP);
          const y = HEIGHT - height;

          return (
            <g key={day.iso}>
              <rect
                x={x}
                y={y}
                width={slot}
                height={height}
                rx={4}
                className={day.completed === 0 ? "fill-line" : "fill-brand"}
              />
              {day.completed > 0 ? (
                <text
                  x={x + slot / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-ink text-[10px] font-semibold"
                >
                  {day.completed}
                </text>
              ) : null}
              <text
                x={x + slot / 2}
                y={HEIGHT + 14}
                textAnchor="middle"
                className="fill-ink-soft text-[10px]"
              >
                {day.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
