import { describe, expect, it } from "vitest";

import { assertSameTenant, tenantScope } from "@/lib/domain/tenant";

describe("tenantScope", () => {
  it("devuelve el filtro con el identificador de empresa", () => {
    expect(tenantScope("emp_123")).toEqual({ companyId: "emp_123" });
  });

  it("recorta espacios sobrantes", () => {
    expect(tenantScope("  emp_123  ")).toEqual({ companyId: "emp_123" });
  });

  it("rechaza un identificador vacío en lugar de consultar sin filtro", () => {
    expect(() => tenantScope("")).toThrow();
    expect(() => tenantScope("   ")).toThrow();
  });
});

describe("assertSameTenant", () => {
  it("acepta un recurso de la misma empresa", () => {
    expect(() => assertSameTenant("emp_123", "emp_123")).not.toThrow();
  });

  it("rechaza un recurso de otra empresa", () => {
    expect(() => assertSameTenant("emp_999", "emp_123")).toThrow();
  });
});
