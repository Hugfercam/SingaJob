import { describe, expect, it } from "vitest";

import {
  PROJECT_STATUSES,
  isProjectStatus,
  projectStatusLabel,
} from "@/lib/domain/projects";

describe("projectStatusLabel", () => {
  it("traduce todos los estados", () => {
    for (const status of PROJECT_STATUSES) {
      expect(projectStatusLabel(status).length).toBeGreaterThan(0);
      expect(projectStatusLabel(status)).not.toBe(status);
    }
  });

  it("traduce los estados concretos", () => {
    expect(projectStatusLabel("ACTIVE")).toBe("En curso");
    expect(projectStatusLabel("PAUSED")).toBe("En pausa");
    expect(projectStatusLabel("FINISHED")).toBe("Terminada");
  });
});

describe("isProjectStatus", () => {
  it("acepta los estados del sistema", () => {
    for (const status of PROJECT_STATUSES) {
      expect(isProjectStatus(status)).toBe(true);
    }
  });

  it("rechaza cualquier otro valor", () => {
    expect(isProjectStatus("")).toBe(false);
    expect(isProjectStatus("activo")).toBe(false);
    expect(isProjectStatus("DELETED")).toBe(false);
    expect(isProjectStatus("active")).toBe(false);
  });
});
