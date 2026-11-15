import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Cliente Prisma con instancia única.
 *
 * Es deliberadamente perezoso: importar este módulo no abre conexiones ni
 * exige DATABASE_URL, para que el build y las pruebas no necesiten una base
 * de datos. En desarrollo se reutiliza la instancia guardada en globalThis
 * para no agotar conexiones con el hot reload.
 */
const globalForPrisma = globalThis as unknown as {
  signajobPrisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Falta la variable de entorno DATABASE_URL. Copia .env.example a .env.",
    );
  }

  // Prisma 7 exige un driver adapter para conectarse a PostgreSQL.
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.signajobPrisma) {
    globalForPrisma.signajobPrisma = createPrismaClient();
  }

  return globalForPrisma.signajobPrisma;
}
