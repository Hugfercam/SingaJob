/**
 * Reglas de una invitación de empleado.
 *
 * Todo lo que decide si una invitación sirve o no vive aquí, sin tocar la base
 * de datos, para poder probarlo con fechas concretas.
 */

/** Días que vale un enlace de invitación desde que se crea. */
export const INVITATION_TTL_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export type InvitationTiming = {
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
};

/**
 * Estado de la invitación. El orden importa: una invitación aceptada sigue
 * siendo "aceptada" aunque después caduque o se revoque, porque ya cumplió su
 * función y el rastro histórico es útil.
 */
export function invitationStatus(
  invitation: InvitationTiming,
  now: Date = new Date(),
): InvitationStatus {
  if (invitation.acceptedAt) {
    return "accepted";
  }

  if (invitation.revokedAt) {
    return "revoked";
  }

  if (invitation.expiresAt.getTime() <= now.getTime()) {
    return "expired";
  }

  return "pending";
}

export function isInvitationUsable(
  invitation: InvitationTiming,
  now: Date = new Date(),
): boolean {
  return invitationStatus(invitation, now) === "pending";
}

export function invitationExpiryFrom(now: Date = new Date()): Date {
  return new Date(now.getTime() + INVITATION_TTL_DAYS * DAY_MS);
}

/** Mensaje único para todos los motivos de rechazo. */
export const INVALID_INVITATION_MESSAGE =
  "Esta invitación no es válida. Puede haber caducado, haberse usado ya o haber sido revocada. Pide una nueva a tu empresa.";
