import { describe, expect, it } from "vitest";

import {
  INVITATION_TTL_DAYS,
  invitationExpiryFrom,
  invitationStatus,
  isInvitationUsable,
} from "@/lib/invitations/invitation";

const NOW = new Date("2026-11-15T10:00:00Z");

function base(overrides: Partial<Parameters<typeof invitationStatus>[0]> = {}) {
  return {
    expiresAt: new Date("2026-11-22T10:00:00Z"),
    acceptedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

describe("invitationStatus", () => {
  it("está pendiente dentro del plazo y sin usar", () => {
    expect(invitationStatus(base(), NOW)).toBe("pending");
  });

  it("caduca al llegar la fecha límite", () => {
    expect(invitationStatus(base(), new Date("2026-11-22T10:00:00Z"))).toBe(
      "expired",
    );
  });

  it("sigue caducada pasado el plazo", () => {
    expect(invitationStatus(base(), new Date("2026-12-01T00:00:00Z"))).toBe(
      "expired",
    );
  });

  it("marca las revocadas", () => {
    expect(invitationStatus(base({ revokedAt: NOW }), NOW)).toBe("revoked");
  });

  it("una aceptada sigue siendo aceptada aunque haya caducado", () => {
    const aceptada = base({ acceptedAt: NOW, revokedAt: NOW });

    expect(invitationStatus(aceptada, new Date("2027-01-01T00:00:00Z"))).toBe(
      "accepted",
    );
  });

  it("aceptada tiene prioridad sobre revocada", () => {
    expect(invitationStatus(base({ acceptedAt: NOW, revokedAt: NOW }), NOW)).toBe(
      "accepted",
    );
  });
});

describe("isInvitationUsable", () => {
  it("solo es usable si está pendiente", () => {
    expect(isInvitationUsable(base(), NOW)).toBe(true);
    expect(isInvitationUsable(base({ acceptedAt: NOW }), NOW)).toBe(false);
    expect(isInvitationUsable(base({ revokedAt: NOW }), NOW)).toBe(false);
    expect(
      isInvitationUsable(base(), new Date("2026-12-01T00:00:00Z")),
    ).toBe(false);
  });
});

describe("invitationExpiryFrom", () => {
  it("suma los días de vigencia configurados", () => {
    const expiry = invitationExpiryFrom(NOW);
    const dias = (expiry.getTime() - NOW.getTime()) / (24 * 60 * 60 * 1000);

    expect(dias).toBe(INVITATION_TTL_DAYS);
  });
});
