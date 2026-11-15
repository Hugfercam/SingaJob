"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { readField } from "@/lib/forms";
import { Role } from "@/lib/generated/prisma/client";

const MAX_NAME = 120;
const MAX_LINE = 160;

export type CompanyState = { error: string } | { ok: true } | null;

/**
 * Datos de la empresa que aparecen en el albarán.
 *
 * Solo el administrador: es la identidad fiscal con la que se emiten los
 * documentos.
 */
export async function updateCompany(
  _previousState: CompanyState,
  formData: FormData,
): Promise<CompanyState> {
  const auth = await requireRole(Role.ADMIN);

  const name = readField(formData, "name");
  const cif = readField(formData, "cif");
  const address = readField(formData, "address");
  const phone = readField(formData, "phone");

  if (!name || name.length < 2) {
    return { error: "El nombre de la empresa es obligatorio." };
  }

  if (name.length > MAX_NAME) {
    return { error: `El nombre no puede pasar de ${MAX_NAME} caracteres.` };
  }

  if (address.length > MAX_LINE) {
    return { error: `La dirección no puede pasar de ${MAX_LINE} caracteres.` };
  }

  await getPrisma().company.update({
    where: { id: auth.company.id },
    data: {
      name,
      cif: cif || null,
      address: address || null,
      phone: phone || null,
    },
  });

  revalidatePath("/mas/empresa");
  revalidatePath("/mas");
  revalidatePath("/panel");

  return { ok: true };
}
