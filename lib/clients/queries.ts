import { getPrisma } from "@/lib/db";
import { normalizeSearchTerm } from "@/lib/domain/search";
import { tenantScope } from "@/lib/domain/tenant";
import type { ProjectStatus } from "@/lib/generated/prisma/client";

export type ClientListItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  projectCount: number;
};

/**
 * Lista de clientes de una empresa, con búsqueda por nombre, teléfono, email o
 * dirección. Siempre acotada a `companyId`.
 */
export async function listClients(
  companyId: string,
  term: string,
): Promise<ClientListItem[]> {
  const query = normalizeSearchTerm(term);

  const clients = await getPrisma().client.findMany({
    where: {
      ...tenantScope(companyId),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { phone: { contains: query } },
              { email: { contains: query, mode: "insensitive" as const } },
              { address: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 100,
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      _count: { select: { projects: true } },
    },
  });

  return clients.map(({ _count, ...client }) => ({
    ...client,
    projectCount: _count.projects,
  }));
}

export type ClientProject = {
  id: string;
  name: string;
  address: string | null;
  status: ProjectStatus;
  createdAt: Date;
};

export type ClientDetail = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: Date;
  projects: ClientProject[];
};

/**
 * Detalle de un cliente con sus obras.
 *
 * `findFirst` con el filtro de empresa (no `findUnique` por id): así un
 * identificador de otra empresa simplemente no existe para esta.
 */
export async function getClientDetail(
  companyId: string,
  clientId: string,
): Promise<ClientDetail | null> {
  return getPrisma().client.findFirst({
    where: { id: clientId, ...tenantScope(companyId) },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      address: true,
      notes: true,
      createdAt: true,
      projects: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          address: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });
}

/** Recuento de clientes y obras para la cabecera y el panel. */
export async function countClientsAndProjects(companyId: string) {
  const scope = tenantScope(companyId);

  const [clients, projects] = await Promise.all([
    getPrisma().client.count({ where: scope }),
    getPrisma().project.count({ where: scope }),
  ]);

  return { clients, projects };
}
