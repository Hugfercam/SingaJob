import { describe, expect, it } from "vitest";

import { normalizeSearchTerm } from "@/lib/domain/search";

describe("normalizeSearchTerm", () => {
  it("quita espacios de los extremos", () => {
    expect(normalizeSearchTerm("  reformas  ")).toBe("reformas");
  });

  it("colapsa espacios repetidos y saltos de línea", () => {
    expect(normalizeSearchTerm("  calle   mayor\n 3 ")).toBe("calle mayor 3");
  });

  it("devuelve cadena vacía si no hay término", () => {
    expect(normalizeSearchTerm("")).toBe("");
    expect(normalizeSearchTerm("     ")).toBe("");
  });

  it("acota la longitud para no enviar consultas absurdas", () => {
    const largo = "a".repeat(500);

    expect(normalizeSearchTerm(largo)).toHaveLength(80);
  });

  it("no altera tildes ni mayúsculas: de eso se encarga la base", () => {
    expect(normalizeSearchTerm("  Peña  ")).toBe("Peña");
  });
});
