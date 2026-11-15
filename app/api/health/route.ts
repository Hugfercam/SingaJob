import { connection, NextResponse } from "next/server";

import { getPrisma } from "@/lib/db";

export async function GET() {
  // Cache Components exige declarar el acceso dinámico de forma explícita:
  // la salud del sistema no puede servirse desde caché.
  await connection();

  try {
    await getPrisma().$queryRaw`SELECT 1`;

    return NextResponse.json({ ok: true, db: "up" });
  } catch (error) {
    console.error("Health check: la base de datos no responde", error);

    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
