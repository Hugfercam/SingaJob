import { describe, expect, it } from "vitest";

import {
  parseFieldDefinitions,
  validateValues,
  type FieldDefinition,
} from "@/lib/work-orders/fields";

function field(overrides: Partial<FieldDefinition>): FieldDefinition {
  return {
    id: "f_1",
    type: "TEXT",
    label: "Campo",
    required: false,
    ...overrides,
  };
}

describe("parseFieldDefinitions", () => {
  it("acepta una definición correcta", () => {
    const fields = parseFieldDefinitions([
      { id: "f_1", type: "TEXT", label: "  Observaciones  ", required: true },
    ]);

    expect(fields).toHaveLength(1);
    expect(fields[0]?.label).toBe("Observaciones");
  });

  it("descarta campos inválidos sin romper el resto", () => {
    const fields = parseFieldDefinitions([
      { id: "f_1", type: "TEXT", label: "Válido", required: false },
      { id: "", type: "TEXT", label: "Sin id", required: false },
      { id: "f_2", type: "INVENTADO", label: "Tipo raro", required: false },
      { id: "f_3", type: "TEXT", label: "   ", required: false },
      { id: "f_4", type: "TEXT", label: "Sin required" },
    ]);

    expect(fields.map((f) => f.id)).toEqual(["f_1"]);
  });

  it("exige opciones en selección y checklist", () => {
    const conOpciones = parseFieldDefinitions([
      { id: "f_1", type: "SELECT", label: "Estado", required: true, options: ["A", "B"] },
    ]);
    const sinOpciones = parseFieldDefinitions([
      { id: "f_1", type: "SELECT", label: "Estado", required: true, options: [] },
    ]);

    expect(conOpciones).toHaveLength(1);
    expect(sinOpciones).toHaveLength(0);
  });

  it("elimina identificadores repetidos", () => {
    const fields = parseFieldDefinitions([
      { id: "f_1", type: "TEXT", label: "Primero", required: false },
      { id: "f_1", type: "TEXT", label: "Repetido", required: false },
    ]);

    expect(fields).toHaveLength(1);
    expect(fields[0]?.label).toBe("Primero");
  });

  it("devuelve vacío si no es un array", () => {
    expect(parseFieldDefinitions(null)).toEqual([]);
    expect(parseFieldDefinitions("{}")).toEqual([]);
    expect(parseFieldDefinitions({})).toEqual([]);
  });
});

describe("validateValues", () => {
  const fields: FieldDefinition[] = [
    field({ id: "texto", type: "TEXT", label: "Texto" }),
    field({ id: "numero", type: "NUMBER", label: "Número" }),
    field({ id: "fecha", type: "DATE", label: "Fecha" }),
    field({ id: "opcion", type: "SELECT", label: "Opción", options: ["A", "B"] }),
    field({ id: "casilla", type: "CHECKBOX", label: "Casilla" }),
    field({ id: "lista", type: "CHECKLIST", label: "Lista", options: ["X", "Y"] }),
  ];

  it("normaliza los tipos correctos", () => {
    const result = validateValues(fields, {
      texto: "  hola  ",
      numero: "12,5",
      fecha: "2026-11-15",
      opcion: "A",
      casilla: "on",
      lista: ["X"],
    });

    expect(result).toEqual({
      ok: true,
      values: {
        texto: "hola",
        numero: 12.5,
        fecha: "2026-11-15",
        opcion: "A",
        casilla: true,
        lista: ["X"],
      },
    });
  });

  it("rechaza un número que no lo es", () => {
    const result = validateValues(fields, { numero: "doce" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.numero).toContain("número");
    }
  });

  it("rechaza una fecha imposible", () => {
    const result = validateValues(fields, { fecha: "2026-02-31" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.fecha).toContain("fecha");
    }
  });

  it("rechaza una opción que no está en la plantilla", () => {
    const result = validateValues(fields, { opcion: "Z" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.opcion).toContain("opción");
    }
  });

  it("descarta elementos de checklist inventados", () => {
    const result = validateValues(fields, { lista: ["X", "INVENTADO"] });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values.lista).toEqual(["X"]);
    }
  });

  it("ignora valores de campos que no están en la definición", () => {
    const result = validateValues(fields, { intruso: "no debería guardarse" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.values).not.toHaveProperty("intruso");
    }
  });

  it("permite guardar a medias si no se exige lo obligatorio", () => {
    const obligatorios = [field({ id: "texto", required: true })];

    const draft = validateValues(obligatorios, { texto: "" });
    const complete = validateValues(obligatorios, { texto: "" }, { enforceRequired: true });

    expect(draft.ok).toBe(true);
    expect(complete.ok).toBe(false);
  });

  it("exige casilla marcada y checklist con algo cuando son obligatorios", () => {
    const obligatorios = [
      field({ id: "casilla", type: "CHECKBOX", required: true }),
      field({ id: "lista", type: "CHECKLIST", required: true, options: ["X"] }),
    ];

    const result = validateValues(obligatorios, {}, { enforceRequired: true });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.casilla).toBeDefined();
      expect(result.errors.lista).toBeDefined();
    }
  });

  it("acepta cadenas con formato de fecha y hora", () => {
    const result = validateValues(fields, { fecha: "15/11/2026" });

    expect(result.ok).toBe(false);
  });
});
