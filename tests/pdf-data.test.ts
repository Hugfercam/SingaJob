import { describe, expect, it } from "vitest";

import {
  formatSignatureDate,
  resolveTechnicianName,
  signatureSignerName,
} from "@/lib/pdf/data";

describe("resolveTechnicianName", () => {
  it("usa el asignado cuando existe", () => {
    expect(resolveTechnicianName("Nuria", "Hugo")).toBe("Nuria");
  });

  it("cae al creador si no hay asignado", () => {
    expect(resolveTechnicianName(null, "Hugo")).toBe("Hugo");
    expect(resolveTechnicianName("  ", "Hugo")).toBe("Hugo");
  });

  it("devuelve null si no hay nadie", () => {
    expect(resolveTechnicianName(null, null)).toBeNull();
    expect(resolveTechnicianName("", "  ")).toBeNull();
  });
});

describe("signatureSignerName", () => {
  it("la firma del cliente lleva el nombre del cliente", () => {
    expect(
      signatureSignerName({
        kind: "SIGNATURE_CLIENT",
        clientName: "Eva María Flor",
        technicianName: "Nuria",
      }),
    ).toBe("Eva María Flor");
  });

  it("la firma del técnico lleva el nombre del técnico", () => {
    expect(
      signatureSignerName({
        kind: "SIGNATURE_TECHNICIAN",
        clientName: "Eva María Flor",
        technicianName: "Nuria",
      }),
    ).toBe("Nuria");
  });

  it("si no se sabe quién firma, no deja el hueco vacío", () => {
    expect(
      signatureSignerName({
        kind: "SIGNATURE_TECHNICIAN",
        clientName: "Eva María Flor",
        technicianName: null,
      }),
    ).toBe("Técnico");
  });
});

describe("formatSignatureDate", () => {
  it("formatea la fecha en corto", () => {
    expect(formatSignatureDate(new Date("2026-11-15T17:53:00Z"))).toBe(
      "15/11/2026",
    );
  });
});
