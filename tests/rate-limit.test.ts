import { describe, expect, it } from "vitest";

import { checkRateLimit, pruneRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";

describe("checkRateLimit", () => {
  it("permite los primeros intentos", () => {
    const key = "login:permite@empresa.com";
    const now = 1_000_000;

    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit(key, now).allowed).toBe(true);
    }
  });

  it("bloquea a partir del sexto intento dentro de la ventana", () => {
    const key = "login:bloquea@empresa.com";
    const now = 2_000_000;

    for (let i = 0; i < 5; i += 1) {
      checkRateLimit(key, now);
    }

    const blocked = checkRateLimit(key, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("vuelve a permitir cuando la ventana caduca", () => {
    const key = "login:caduca@empresa.com";
    const now = 3_000_000;

    for (let i = 0; i < 6; i += 1) {
      checkRateLimit(key, now);
    }

    expect(checkRateLimit(key, now).allowed).toBe(false);
    // 16 minutos después la ventana de 15 ya venció.
    expect(checkRateLimit(key, now + 16 * 60 * 1000).allowed).toBe(true);
  });

  it("separa los contadores por clave", () => {
    const now = 4_000_000;

    for (let i = 0; i < 5; i += 1) {
      checkRateLimit("login:uno@empresa.com", now);
    }

    expect(checkRateLimit("login:uno@empresa.com", now).allowed).toBe(false);
    expect(checkRateLimit("login:dos@empresa.com", now).allowed).toBe(true);
  });

  it("resetRateLimit libera la clave", () => {
    const key = "login:reset@empresa.com";
    const now = 5_000_000;

    for (let i = 0; i < 6; i += 1) {
      checkRateLimit(key, now);
    }
    expect(checkRateLimit(key, now).allowed).toBe(false);

    resetRateLimit(key);
    expect(checkRateLimit(key, now).allowed).toBe(true);
  });

  it("pruneRateLimit elimina ventanas vencidas", () => {
    const key = "login:prune@empresa.com";
    const now = 6_000_000;

    for (let i = 0; i < 6; i += 1) {
      checkRateLimit(key, now);
    }
    expect(checkRateLimit(key, now).allowed).toBe(false);

    pruneRateLimit(now + 16 * 60 * 1000);
    expect(checkRateLimit(key, now + 16 * 60 * 1000).allowed).toBe(true);
  });
});
