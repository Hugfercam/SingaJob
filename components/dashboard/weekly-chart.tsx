import type { WeekSummary } from "@/lib/dashboard/queries";

const WIDTH = 320;
const HEIGHT = 84;
const ROW_GAP = 6;

/**
 * Actividad de la semana en SVG a mano: sin librerías, sin JavaScript en el
 * cliente y con los datos también en texto para lectores de pantalla.
 *
 * La semana anterior va detrás en gris claro: la comparación se ve sin leer
 * ninguna cifra.
 */
export function WeeklyChart({ summary }: { summary: WeekSummary }) {
  const { days, currentTotal, previousTotal, delta } = summary;
  const max = Math.max(1, ...days.map((day) => Math.max(day.current, day.previous)));
  const slot = (WIDTH - ROW_GAP * (days.length - 1)) / days.length;

  const detail = days
    .map((day) => `${day.label}: ${day.current} (antes ${day.previous})`)
    .join(", ");

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-ink-soft">
          {currentTotal === 0
            ? "Sin partes completados esta semana."
            : `${currentTotal} ${currentTotal === 1 ? "parte completado" : "partes completados"} esta semana.`}
        </span>
        {previousTotal > 0 || currentTotal > 0 ? (
          <span
            className={`tabular text-xs font-semibold ${
              delta > 0 ? "text-ok" : delta < 0 ? "text-danger" : "text-ink-soft"
            }`}
          >
            {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "igual"} vs. anterior
          </span>
        ) : null}
      </figcaption>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT + 18}`}
        role="img"
        aria-label={`Partes completados por día, con la semana anterior entre paréntesis. ${detail}`}
        className="h-28 w-full"
      >
        {days.map((day, index) => {
          const x = index * (slot + ROW_GAP);
          const currentHeight =
            day.current === 0 ? 2 : (day.current / max) * HEIGHT;
          const previousHeight =
            day.previous === 0 ? 0 : (day.previous / max) * HEIGHT;
          const barWidth = (slot - 4) / 2;

          return (
            <g key={day.iso}>
              <rect
                x={x}
                y={HEIGHT - previousHeight}
                width={barWidth}
                height={Math.max(previousHeight, day.previous > 0 ? 3 : 0)}
                rx={3}
                className="fill-line"
              />
              <rect
                x={x + barWidth + 3}
                y={HEIGHT - currentHeight}
                width={barWidth}
                height={currentHeight}
                rx={3}
                className={day.current === 0 ? "fill-line/70" : "fill-brand"}
              />
              {day.current > 0 ? (
                <text
                  x={x + barWidth + 3 + barWidth / 2}
                  y={HEIGHT - currentHeight - 4}
                  textAnchor="middle"
                  className="fill-ink text-[10px] font-semibold"
                >
                  {day.current}
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
