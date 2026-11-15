"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/domain/email";
import { isProjectStatus } from "@/lib/domain/projects";
import { tenantScope } from "@/lib/domain/tenant";
import { readField } from "@/lib/forms";
import { Role } from "@/lib/generated/prisma/client";

const MAX_NAME_LENGTH = 120;
const MAX_PHONE_LENGTH = 40;
const MAX_ADDRESS_LENGTH = 200;

export type ClientFormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type ClientFormState =
  | { error: string; values?: ClientFormValues }
  | null;

export type ProjectFormState =
  | { error: string; values?: { name: string; address: string } }
  | null;

function readOptional(formData: FormData, key: string): string | null {
  const value = readField(formData, key);

  return value.length > 0 ? value : null;
}

type ClientValidation =
  | {
      ok: true;
      values: ClientFormValues;
      data: {
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        notes: string | null;
      };
    }
  | { ok: false; error: string; values: ClientFormValues };

/** Validación compartida por alta y edición de cliente. */
function validateClient(formData: FormData): ClientValidation {
  const name = readField(formData, "name");
  const phone = readOptional(formData, "phone");
  const email = normalizeEmail(readField(formData, "email"));
  const address = readOptional(formData, "address");
  const notes = readOptional(formData, "notes");

  const values: ClientFormValues = {
    name,
    phone: phone ?? "",
    email,
    address: address ?? "",
    notes: notes ?? "",
  };

  if (!name) {
    return { ok: false, error: "Escribe el nombre del cliente.", values };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      error: `El nombre no puede pasar de ${MAX_NAME_LENGTH} caracteres.`,
      values,
    };
  }

  if (phone && phone.length > MAX_PHONE_LENGTH) {
    return { ok: false, error: "Ese teléfono es demasiado largo.", values };
  }

  if (email && !isValidEmail(email)) {
    return { ok: false, error: "Ese email no parece válido.", values };
  }

  if (address && address.length > MAX_ADDRESS_LENGTH) {
    return { ok: false, error: "Esa dirección es demasiado larga.", values };
  }

  return {
    ok: true,
    values,
    data: {
      name,
      phone,
      email: email.length > 0 ? email : null,
      address,
      notes,
    },
  };
}

export async function createClient(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER);
  const validation = validateClient(formData);

  if (!validation.ok) {
    return { error: validation.error, values: validation.values };
  }

  const client = await getPrisma().client.create({
    data: { companyId: auth.company.id, ...validation.data },
    select: { id: true },
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${client.id}`);
}

export async function updateClient(
  _previousState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER);
  const clientId = readField(formData, "clientId");

  if (!clientId) {
    return { error: "Falta el cliente que quieres editar." };
  }

  const validation = validateClient(formData);

  if (!validation.ok) {
    return { error: validation.error, values: validation.values };
  }

  const updated = await getPrisma().client.updateMany({
    where: { id: clientId, ...tenantScope(auth.company.id) },
    data: validation.data,
  });

  if (updated.count === 0) {
    return { error: "Ese cliente no existe en tu empresa." };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${clientId}`);
  redirect(`/clientes/${clientId}`);
}

export async function createProject(
  _previousState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER);

  const clientId = readField(formData, "clientId");
  const name = readField(formData, "name");
  const address = readOptional(formData, "address");
  const values = { name, address: address ?? "" };

  if (!clientId) {
    return { error: "Falta el cliente de la obra.", values };
  }

  if (!name) {
    return { error: "Escribe el nombre de la obra.", values };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      error: `El nombre no puede pasar de ${MAX_NAME_LENGTH} caracteres.`,
      values,
    };
  }

  const prisma = getPrisma();

  const client = await prisma.client.findFirst({
    where: { id: clientId, ...tenantScope(auth.company.id) },
    select: { id: true },
  });

  if (!client) {
    return { error: "Ese cliente no existe en tu empresa.", values };
  }

  await prisma.project.create({
    data: {
      companyId: auth.company.id,
      clientId: client.id,
      name,
      address,
    },
  });

  revalidatePath(`/clientes/${clientId}`);
  redirect(`/clientes/${clientId}`);
}

export async function updateProjectStatus(formData: FormData): Promise<void> {
  const auth = await requireRole(Role.ADMIN, Role.MANAGER);

  const projectId = readField(formData, "projectId");
  const status = readField(formData, "status");

  if (!projectId || !isProjectStatus(status)) {
    return;
  }

  const prisma = getPrisma();

  const project = await prisma.project.findFirst({
    where: { id: projectId, ...tenantScope(auth.company.id) },
    select: { clientId: true },
  });

  if (!project) {
    return;
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  revalidatePath(`/clientes/${project.clientId}`);
}
