"use server";

import { redirect } from "next/navigation";

import { getPrisma, isUniqueViolation } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/domain/email";
import { readField } from "@/lib/forms";
import { Role } from "@/lib/generated/prisma/client";

import { hashPassword, verifyPassword } from "./password";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import { createSession, destroySession, requestMeta } from "./session";

const MIN_PASSWORD_LENGTH = 10;
const MAX_PASSWORD_LENGTH = 200;

/**
 * Hash válido de una contraseña ficticia. Se usa cuando el email no existe,
 * para que el login haga el mismo trabajo criptográfico y no se pueda deducir
 * qué emails están dados de alta midiendo el tiempo de respuesta.
 */
const DUMMY_HASH =
  "scrypt$16384$8$1$pvpM1M2XACFFpCuuoJcpKA$mg6xQyhdy3iI-2wRqZ0TXW1yIe6yoGd0mqiKlaBWBB4bUulXq5WPRU1kI8aiNFxYB6H9BoCT4Sv9hfQiU5OaUA";

export type AuthFormValues = {
  companyName?: string;
  name?: string;
  email?: string;
};

export type AuthState = { error: string; values?: AuthFormValues } | null;

/** Alta de empresa y de su primer usuario administrador, en una transacción. */
export async function registerCompany(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const companyName = readField(formData, "companyName");
  const name = readField(formData, "name");
  const email = normalizeEmail(readField(formData, "email"));
  const password = readField(formData, "password", false);

  const values: AuthFormValues = { companyName, name, email };

  if (!companyName) {
    return { error: "Escribe el nombre de la empresa.", values };
  }

  if (!name) {
    return { error: "Escribe tu nombre.", values };
  }

  if (!isValidEmail(email)) {
    return { error: "Ese email no parece válido.", values };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
      values,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      error: `La contraseña no puede pasar de ${MAX_PASSWORD_LENGTH} caracteres.`,
      values,
    };
  }

  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return {
      error: "Ya existe una cuenta con ese email. Inicia sesión.",
      values,
    };
  }

  const passwordHash = await hashPassword(password);

  let userId: string;

  try {
    const user = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName },
        select: { id: true },
      });

      return tx.user.create({
        data: {
          companyId: company.id,
          email,
          name,
          role: Role.ADMIN,
          passwordHash,
        },
        select: { id: true },
      });
    });

    userId = user.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error: "Ya existe una cuenta con ese email. Inicia sesión.",
        values,
      };
    }

    console.error("Registro: no se pudo crear la empresa", error);

    return { error: "No se pudo crear la cuenta. Inténtalo de nuevo.", values };
  }

  await createSession(userId, await requestMeta());
  redirect("/panel");
}

export async function login(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(readField(formData, "email"));
  const password = readField(formData, "password", false);

  const values: AuthFormValues = { email };

  if (!email || !password) {
    return { error: "Escribe tu email y tu contraseña.", values };
  }

  const limitKey = `login:${email}`;
  const limit = checkRateLimit(limitKey);

  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterMs / 60_000));

    return {
      error: `Demasiados intentos fallidos. Espera ${minutes} minuto(s).`,
      values,
    };
  }

  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, active: true, passwordHash: true },
  });

  // Se verifica siempre, exista o no el usuario, para no filtrar qué emails
  // están registrados ni por tiempo de respuesta ni por mensaje distinto.
  const passwordMatches = await verifyPassword(
    password,
    user?.passwordHash ?? DUMMY_HASH,
  );

  if (!user || !passwordMatches || !user.active) {
    return { error: "Email o contraseña incorrectos.", values };
  }

  resetRateLimit(limitKey);
  await createSession(user.id, await requestMeta());
  redirect("/panel");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
