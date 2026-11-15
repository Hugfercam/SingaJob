import { hashSessionToken } from "@/lib/auth/token";
import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import type { Role } from "@/lib/generated/prisma/client";

import { invitationStatus, type InvitationStatus } from "./invitation";

export type PendingInvitation = {
  id: string;
  email: string;
  role: Role;
  expiresAt: Date;
  createdAt: Date;
};

/** Invitaciones que todavía se pueden usar en una empresa. */
export async function listPendingInvitations(
  companyId: string,
): Promise<PendingInvitation[]> {
  const invitations = await getPrisma().invitation.findMany({
    where: {
      ...tenantScope(companyId),
      acceptedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return invitations;
}

export type InvitationByToken = {
  id: string;
  companyName: string;
  email: string;
  role: Role;
  status: InvitationStatus;
};

/** Busca la invitación por su token en claro. Solo se usa en la página pública. */
export async function findInvitationByToken(
  token: string,
): Promise<InvitationByToken | null> {
  if (!token || token.length < 20) {
    return null;
  }

  const invitation = await getPrisma().invitation.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      company: { select: { name: true } },
    },
  });

  if (!invitation) {
    return null;
  }

  return {
    id: invitation.id,
    companyName: invitation.company.name,
    email: invitation.email,
    role: invitation.role,
    status: invitationStatus(invitation),
  };
}
