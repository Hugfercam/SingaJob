"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { createSession, requestMeta } from "@/lib/auth/session";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/token";
import { getPrisma, isUniqueViolation } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/domain/email";
import { tenantScope } from "@/lib/domain/tenant";
import { readField } from "@/lib/forms";
import { Role } from "@/lib/generated/prisma/client";

import {
  INVALID_INVITATION_MESSAGE,
  INVITATION_TTL_DAYS,
  invitationExpiryFrom,
  invitationStatus,
} from "./invitation";

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 200;

export type InviteState =
  | { status: "error"; message: string; email?: string }
  | { status: "ok"; message: string; link?: string; email?: string }
  | null;

export type AcceptState = { error: string; name?: string } | null;

function isRole(value: string): value is Role {
  return (Object.values(Role) as string[]).includes(value);
}

/**
 * Crea una invitación para un empleado.
 *
 * Solo administradores. Las reglas del orden importan: primero se comprueba si
 * la persona ya existe, y solo si no existe se genera el enlace.
 */
export async function inviteEmployee(
  _previousState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const auth = await requireRole(Role.ADMIN);

  const email = normalizeEmail(readField(formData, "email"));
  const roleField = readField(formData, "role");
  const role = isRole(roleField) ? roleField : Role.TECHNICIAN;

  if (!isValidEmail(email)) {
    return { status: "error", message: "Ese email no parece válido.", email };
  }

  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, companyId: true, active: true },
  });

  if (existing) {
    if (existing.companyId !== auth.company.id) {
      return {
        status: "error",
        message:
          "Ese email ya pertenece a otra empresa. Necesitará una cuenta con otro email.",
        email,
      };
    }

    if (existing.active) {
      return {
        status: "error",
        message: "Esa persona ya está en tu equipo.",
        email,
      };
    }

    // Estaba desactivada en esta misma empresa: se reactiva sin invitación.
    await prisma.user.update({
      where: { id: existing.id },
      data: { active: true, role },
      select: { id: true },
    });

    revalidatePath("/equipo");

    return {
      status: "ok",
      message: "Esa persona estaba desactivada: la hemos reactivado en tu equipo.",
      email,
    };
  }

  const token = generateSessionToken();
  const expiresAt = invitationExpiryFrom();

  try {
    await prisma.$transaction([
      // Solo puede haber una invitación viva por persona y empresa.
      prisma.invitation.updateMany({
        where: {
          ...tenantScope(auth.company.id),
          email,
          acceptedAt: null,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      }),
      prisma.invitation.create({
        data: {
          companyId: auth.company.id,
          email,
          role,
          tokenHash: hashSessionToken(token),
          expiresAt,
          createdById: auth.user.id,
        },
      }),
    ]);
  } catch (error) {
    console.error("Invitación: no se pudo crear", error);

    return {
      status: "error",
      message: "No se pudo crear la invitación. Inténtalo de nuevo.",
      email,
    };
  }

  revalidatePath("/equipo");

  return {
    status: "ok",
    message: `Invitación creada. Caduca en ${INVITATION_TTL_DAYS} días y solo sirve una vez.`,
    link: `/invitacion/${token}`,
    email,
  };
}

/** Revoca una invitación pendiente de la propia empresa. */
export async function revokeInvitation(formData: FormData): Promise<void> {
  const auth = await requireRole(Role.ADMIN);
  const id = readField(formData, "id");

  if (!id) {
    return;
  }

  await getPrisma().invitation.updateMany({
    where: {
      id,
      ...tenantScope(auth.company.id),
      acceptedAt: null,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });

  revalidatePath("/equipo");
}

/**
 * Acepta una invitación: crea el usuario con la empresa y el rol invitados.
 *
 * El email de la invitación no se puede editar: el enlace lo define. La marca
 * de "aceptada" y la creación del usuario van en la misma transacción, y la
 * condición `acceptedAt: null` impide que dos peticiones simultáneas la usen.
 */
export async function acceptInvitation(
  token: string,
  _previousState: AcceptState,
  formData: FormData,
): Promise<AcceptState> {
  const name = readField(formData, "name");
  const password = readField(formData, "password", false);

  const prisma = getPrisma();

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: {
      id: true,
      companyId: true,
      email: true,
      role: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
    },
  });

  if (!invitation || invitationStatus(invitation) !== "pending") {
    return { error: INVALID_INVITATION_MESSAGE };
  }

  if (!name) {
    return { error: "Escribe tu nombre.", name };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      name,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      error: `La contraseña no puede pasar de ${MAX_PASSWORD_LENGTH} caracteres.`,
      name,
    };
  }

  const passwordHash = await hashPassword(password);

  let userId: string;

  try {
    const user = await prisma.$transaction(async (tx) => {
      const marked = await tx.invitation.updateMany({
        where: {
          id: invitation.id,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: { acceptedAt: new Date() },
      });

      if (marked.count !== 1) {
        throw new Error("invitacion-no-disponible");
      }

      return tx.user.create({
        data: {
          companyId: invitation.companyId,
          email: invitation.email,
          name,
          role: invitation.role,
          passwordHash,
        },
        select: { id: true },
      });
    });

    userId = user.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error:
          "Ya existe una cuenta con ese email. Inicia sesión o pide otra invitación.",
        name,
      };
    }

    console.error("Invitación: no se pudo aceptar", error);

    return { error: "No se pudo completar la invitación. Pide una nueva.", name };
  }

  await createSession(userId, await requestMeta());
  redirect("/panel");
}
