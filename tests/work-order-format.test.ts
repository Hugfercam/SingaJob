import { describe, expect, it } from "vitest";

import type { FieldDefinition } from "@/lib/work-orders/fields";
import {
  formatCoordinates,
  formatFieldValue,
  formatIsoDate,
} from "@/lib/work-orders/format";

function field(overrides: Partial<FieldDefinition>): FieldDefinition {
  return {
    id: "f_1",
    type: "TEXT",
    label: "Campo",
    required: false,
    ...overrides,
  };
}

describe("formatFieldValue", () => {
  it("deja el texto tal cual", () => {
    expect(formatFieldValue(field({ type: "TEXT" }), "Hola")).toBe("Hola");
  });

  it("traduce la casilla a Sí/No", () => {
    expect(formatFieldValue(field({ type: "CHECKBOX" }), true)).toBe("Sí");
    expect(formatFieldValue(field({ type: "CHECKBOX" }), false)).toBe("No");
  });

  it("une la lista con comas", () => {
    expect(
      formatFieldValue(field({ type: "CHECKLIST" }), ["Paso 1", "Paso 3"]),
    ).toBe("Paso 1, Paso 3");
  });

  it("formatea el número en español", () => {
    expect(formatFieldValue(field({ type: "NUMBER" }), 1234.5)).toBe("1234,5");
  });

  it("formatea la fecha como dd/mm/aaaa", () => {
    expect(formatFieldValue(field({ type: "DATE" }), "2026-11-15")).toBe(
      "15/11/2026",
    );
  });

  it("devuelve vacío si no hay valor", () => {
    expect(formatFieldValue(field({ type: "TEXT" }), null)).toBe("");
    expect(formatFieldValue(field({ type: "TEXT" }), undefined)).toBe("");
  });
});

describe("formatIsoDate", () => {
  it("convierte una fecha válida", () => {
    expect(formatIsoDate("2026-01-05")).toBe("05/01/2026");
  });

  it("devuelve el valor original si no encaja", () => {
    expect(formatIsoDate("15/11/2026")).toBe("15/11/2026");
    expect(formatIsoDate("")).toBe("");
  });
});

describe("formatCoordinates", () => {
  it("formatea latitud y longitud", () => {
    expect(formatCoordinates(39.4699, -0.3763)).toBe("39.46990, -0.37630");
  });

  it("devuelve null si falta alguna", () => {
    expect(formatCoordinates(null, -0.3763)).toBeNull();
    expect(formatCoordinates(39.4699, null)).toBeNull();
    expect(formatCoordinates(Number.NaN, 1)).toBeNull();
  });
});
