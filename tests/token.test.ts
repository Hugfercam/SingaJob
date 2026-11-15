import { describe, expect, it } from "vitest";

import { generateSessionToken, hashSessionToken } from "@/lib/auth/token";

describe("generateSessionToken", () => {
  it("genera tokens distintos cada vez", () => {
    const tokens = new Set(Array.from({ length: 50 }, generateSessionToken));

    expect(tokens.size).toBe(50);
  });

  it("genera 32 bytes en base64url", () => {
    const token = generateSessionToken();

    // 32 bytes -> 43 caracteres en base64url sin relleno.
    expect(token).toHaveLength(43);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("hashSessionToken", () => {
  it("es determinista", () => {
    const token = "un-token-cualquiera";

    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it("produce un sha256 en hexadecimal", () => {
    expect(hashSessionToken("un-token-cualquiera")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("cambia por completo con un token distinto", () => {
    expect(hashSessionToken("token-a")).not.toBe(hashSessionToken("token-b"));
  });
});
