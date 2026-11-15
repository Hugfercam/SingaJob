import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("hashPassword", () => {
  it("genera el formato versionado con sus parámetros", async () => {
    const hash = await hashPassword("contraseña-de-prueba");

    const parts = hash.split("$");
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("scrypt");
    expect(Number(parts[1])).toBeGreaterThanOrEqual(1024);
  });

  it("usa una sal distinta cada vez", async () => {
    const a = await hashPassword("contraseña-de-prueba");
    const b = await hashPassword("contraseña-de-prueba");

    expect(a).not.toBe(b);
  });

  it("no contiene la contraseña en claro", async () => {
    const hash = await hashPassword("mi-contraseña-secreta");

    expect(hash).not.toContain("mi-contraseña-secreta");
  });
});

describe("verifyPassword", () => {
  it("acepta la contraseña correcta", async () => {
    const hash = await hashPassword("contraseña-de-prueba");

    await expect(verifyPassword("contraseña-de-prueba", hash)).resolves.toBe(
      true,
    );
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("contraseña-de-prueba");

    await expect(verifyPassword("otra-contraseña", hash)).resolves.toBe(false);
  });

  it("trata igual las formas Unicode equivalentes", async () => {
    // "é" precompuesto frente a "e" + acento combinado.
    const hash = await hashPassword("caf\u00e9-contraseña");

    await expect(verifyPassword("cafe\u0301-contraseña", hash)).resolves.toBe(
      true,
    );
  });

  it("falla cerrado ante un formato desconocido", async () => {
    await expect(verifyPassword("x", "")).resolves.toBe(false);
    await expect(verifyPassword("x", "bcrypt$abc")).resolves.toBe(false);
    await expect(verifyPassword("x", "scrypt$1$2$3$4$5")).resolves.toBe(false);
    await expect(
      verifyPassword("x", "scrypt$abc$8$1$c2FsdA$aGFzaA"),
    ).resolves.toBe(false);
  });

  it("rechaza parámetros fuera de rango en lugar de consumir CPU", async () => {
    const hash = await hashPassword("contraseña-de-prueba");
    const parts = hash.split("$");
    // N desmesurado: 2^30, inviable a propósito.
    parts[1] = String(1_073_741_824);

    await expect(verifyPassword("contraseña-de-prueba", parts.join("$"))).resolves.toBe(
      false,
    );
  });

  it("rechaza un hash manipulado", async () => {
    const hash = await hashPassword("contraseña-de-prueba");
    const parts = hash.split("$");

    // Sustituye el digest completo por otro de la misma longitud: si se
    // cambiara solo el último carácter de base64url podría decodificarse a los
    // mismos bytes (los bits sobrantes se descartan) y la prueba sería falsa.
    parts[5] = Buffer.alloc(64, 7).toString("base64url");

    await expect(verifyPassword("contraseña-de-prueba", parts.join("$"))).resolves.toBe(
      false,
    );
  });

  it("rechaza una sal manipulada", async () => {
    const hash = await hashPassword("contraseña-de-prueba");
    const parts = hash.split("$");

    parts[4] = Buffer.alloc(16, 9).toString("base64url");

    await expect(verifyPassword("contraseña-de-prueba", parts.join("$"))).resolves.toBe(
      false,
    );
  });
});
