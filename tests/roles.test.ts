import { describe, expect, it } from "vitest";

import { Role } from "@/lib/generated/prisma/client";
import { roleLabel } from "@/lib/domain/roles";

describe("roleLabel", () => {
  it("traduce todos los roles del sistema", () => {
    for (const role of Object.values(Role)) {
      expect(roleLabel(role).length).toBeGreaterThan(0);
      expect(roleLabel(role)).not.toBe(role);
    }
  });

  it("traduce los roles concretos", () => {
    expect(roleLabel(Role.ADMIN)).toBe("Administrador");
    expect(roleLabel(Role.MANAGER)).toBe("Encargado");
    expect(roleLabel(Role.TECHNICIAN)).toBe("Técnico");
  });
});
