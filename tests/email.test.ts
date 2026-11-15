import { describe, expect, it } from "vitest";

import { isValidEmail, normalizeEmail } from "@/lib/domain/email";

describe("normalizeEmail", () => {
  it("pasa a minúsculas y quita espacios", () => {
    expect(normalizeEmail("  Ana.Perez@Empresa.COM ")).toBe(
      "ana.perez@empresa.com",
    );
  });

  it("es idempotente", () => {
    const once = normalizeEmail("Ana@Empresa.com");

    expect(normalizeEmail(once)).toBe(once);
  });
});

describe("isValidEmail", () => {
  it("acepta emails razonables", () => {
    expect(isValidEmail("ana@empresa.com")).toBe(true);
    expect(isValidEmail("ana.perez+obras@sub.empresa.es")).toBe(true);
  });

  it("rechaza valores que no son emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("ana")).toBe(false);
    expect(isValidEmail("ana@")).toBe(false);
    expect(isValidEmail("ana@empresa")).toBe(false);
    expect(isValidEmail("ana empresa@com")).toBe(false);
    expect(isValidEmail("ana@empresa .com")).toBe(false);
  });

  it("rechaza valores desmesurados", () => {
    const largo = `${"a".repeat(250)}@empresa.com`;

    expect(isValidEmail(largo)).toBe(false);
  });
});
