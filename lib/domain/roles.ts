import type { Role } from "@/lib/generated/prisma/client";

const LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  MANAGER: "Encargado",
  TECHNICIAN: "Técnico",
};

export function roleLabel(role: Role): string {
  return LABELS[role];
}
