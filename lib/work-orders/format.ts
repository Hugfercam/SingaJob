import type { FieldDefinition } from "./fields";

const numberFormat = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 3,
});

/** Convierte el valor guardado en algo legible para la interfaz y el PDF. */
export function formatFieldValue(
  field: FieldDefinition,
  value: unknown,
): string {
  if (value === undefined || value === null) {
    return "";
  }

  switch (field.type) {
    case "CHECKBOX":
      return value === true ? "Sí" : "No";

    case "CHECKLIST":
      return Array.isArray(value)
        ? value.filter((item) => typeof item === "string").join(", ")
        : "";

    case "NUMBER":
      return typeof value === "number" ? numberFormat.format(value) : String(value);

    case "DATE":
      return formatIsoDate(typeof value === "string" ? value : "");

    default:
      return typeof value === "string" ? value : String(value);
  }
}

/** `2026-11-15` → `15/11/2026`. Si no encaja, se devuelve tal cual. */
export function formatIsoDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

export function formatCoordinates(
  latitude: number | null,
  longitude: number | null,
): string | null {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
