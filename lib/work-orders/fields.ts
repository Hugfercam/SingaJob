/**
 * Definición y validación de campos de un parte.
 *
 * Los campos se guardan como JSON (D-009), así que todo lo que entra desde el
 * editor o desde un formulario se valida aquí antes de escribir en la base.
 * Nada de lo que llega del cliente se guarda sin pasar por estas funciones.
 */

export const FIELD_TYPES = [
  "TEXT",
  "LONG_TEXT",
  "NUMBER",
  "DATE",
  "SELECT",
  "CHECKBOX",
  "CHECKLIST",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type FieldDefinition = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
  help?: string;
};

export type FieldValue = string | number | boolean | string[];

export type WorkOrderValues = Record<string, FieldValue>;

const MAX_LABEL = 120;
const MAX_HELP = 200;
const MAX_OPTION = 80;
const MAX_OPTIONS = 50;
const MAX_FIELDS = 40;

export function isFieldType(value: string): value is FieldType {
  return (FIELD_TYPES as readonly string[]).includes(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanOptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const options = value
    .filter((option): option is string => typeof option === "string")
    .map((option) => option.trim())
    .filter((option) => option.length > 0 && option.length <= MAX_OPTION)
    .slice(0, MAX_OPTIONS);

  return options.length > 0 ? options : null;
}

/** Valida una definición de campo suelta, tal como llega del editor. */
export function isValidFieldDefinition(value: unknown): value is FieldDefinition {
  if (!isPlainObject(value)) {
    return false;
  }

  const { id, type, label, required, options, help } = value;

  if (typeof id !== "string" || id.trim().length === 0 || id.length > 40) {
    return false;
  }

  if (typeof type !== "string" || !isFieldType(type)) {
    return false;
  }

  if (typeof label !== "string") {
    return false;
  }

  const cleanLabel = label.trim();

  if (cleanLabel.length === 0 || cleanLabel.length > MAX_LABEL) {
    return false;
  }

  if (typeof required !== "boolean") {
    return false;
  }

  if (help !== undefined && help !== null) {
    if (typeof help !== "string" || help.length > MAX_HELP) {
      return false;
    }
  }

  if (type === "SELECT" || type === "CHECKLIST") {
    return cleanOptions(options) !== null;
  }

  return options === undefined || options === null || Array.isArray(options);
}

/**
 * Normaliza la definición de una plantilla: descarta campos inválidos, aplica
 * límites y elimina identificadores repetidos. Nunca lanza.
 */
export function parseFieldDefinitions(value: unknown): FieldDefinition[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const fields: FieldDefinition[] = [];

  for (const candidate of value.slice(0, MAX_FIELDS)) {
    if (!isValidFieldDefinition(candidate)) {
      continue;
    }

    const id = candidate.id.trim();

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);

    const options = cleanOptions(candidate.options);
    const help = typeof candidate.help === "string" ? candidate.help.trim() : "";

    fields.push({
      id,
      type: candidate.type,
      label: candidate.label.trim(),
      required: candidate.required,
      ...(options ? { options } : {}),
      ...(help.length > 0 ? { help } : {}),
    });
  }

  return fields;
}

/** Extrae los identificadores de campo de un JSON guardado en la base. */
export function readFieldDefinitions(value: unknown): FieldDefinition[] {
  return parseFieldDefinitions(value);
}

export type ValidationResult =
  | { ok: true; values: WorkOrderValues }
  | { ok: false; errors: Record<string, string>; values: WorkOrderValues };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function isBlank(value: unknown): boolean {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

/**
 * Valida y normaliza los valores de un parte contra su definición.
 *
 * - Los tipos se comprueban siempre.
 * - Los campos obligatorios solo se exigen al completar (`enforceRequired`),
 *   para que se pueda guardar un borrador a medias.
 * - Los valores de campos que ya no existen en la definición se descartan.
 */
export function validateValues(
  fields: FieldDefinition[],
  raw: unknown,
  options: { enforceRequired?: boolean } = {},
): ValidationResult {
  const enforceRequired = options.enforceRequired ?? false;
  const input = isPlainObject(raw) ? raw : {};

  const values: WorkOrderValues = {};
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const current = input[field.id];

    switch (field.type) {
      case "TEXT":
      case "LONG_TEXT": {
        const text = typeof current === "string" ? current.trim() : "";

        if (text.length === 0) {
          if (enforceRequired && field.required) {
            errors[field.id] = "Este campo es obligatorio.";
          }
          break;
        }

        values[field.id] = text;
        break;
      }

      case "NUMBER": {
        if (isBlank(current)) {
          if (enforceRequired && field.required) {
            errors[field.id] = "Este campo es obligatorio.";
          }
          break;
        }

        const numeric =
          typeof current === "number" ? current : Number(String(current).replace(",", "."));

        if (!Number.isFinite(numeric)) {
          errors[field.id] = "Escribe un número válido.";
          break;
        }

        values[field.id] = numeric;
        break;
      }

      case "DATE": {
        const date = typeof current === "string" ? current.trim() : "";

        if (date.length === 0) {
          if (enforceRequired && field.required) {
            errors[field.id] = "Este campo es obligatorio.";
          }
          break;
        }

        if (!isRealDate(date)) {
          errors[field.id] = "La fecha no es válida.";
          break;
        }

        values[field.id] = date;
        break;
      }

      case "SELECT": {
        const selected = typeof current === "string" ? current.trim() : "";
        const allowed = field.options ?? [];

        if (selected.length === 0) {
          if (enforceRequired && field.required) {
            errors[field.id] = "Elige una opción.";
          }
          break;
        }

        if (!allowed.includes(selected)) {
          errors[field.id] = "Esa opción no está en la plantilla.";
          break;
        }

        values[field.id] = selected;
        break;
      }

      case "CHECKBOX": {
        const checked = current === true || current === "on" || current === "true";

        values[field.id] = checked;

        if (enforceRequired && field.required && !checked) {
          errors[field.id] = "Debes marcar esta casilla.";
        }
        break;
      }

      case "CHECKLIST": {
        const allowed = field.options ?? [];
        const picked = Array.isArray(current)
          ? current.filter((item): item is string => typeof item === "string")
          : [];

        const valid = allowed.filter((option) => picked.includes(option));

        if (valid.length === 0) {
          if (enforceRequired && field.required) {
            errors[field.id] = "Marca al menos un elemento.";
          }
          break;
        }

        values[field.id] = valid;
        break;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors, values };
  }

  return { ok: true, values };
}
