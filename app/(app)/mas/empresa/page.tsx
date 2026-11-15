import type { Metadata } from "next";
import Link from "next/link";

import { CompanyForm } from "@/components/company/company-form";
import { SectionTitle } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth/guards";
import { getPrisma } from "@/lib/db";
import { Role } from "@/lib/generated/prisma/client";

export const metadata: Metadata = {
  title: "Datos de la empresa",
};

export const instant = false;

export default async function CompanyPage() {
  const auth = await requireRole(Role.ADMIN);

  const company = await getPrisma().company.findUniqueOrThrow({
    where: { id: auth.company.id },
    select: { name: true, cif: true, address: true, phone: true },
  });

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-2xl leading-tight font-semibold text-ink">
          Datos de la empresa
        </h1>
        <p className="text-sm text-ink-soft">
          Estos datos aparecen en la cabecera de cada albarán.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <SectionTitle>Emisor</SectionTitle>
        <CompanyForm
          defaultValues={{
            name: company.name,
            cif: company.cif ?? "",
            address: company.address ?? "",
            phone: company.phone ?? "",
          }}
        />
      </section>

      <Link
        href="/mas"
        className="text-sm font-medium text-brand underline underline-offset-4"
      >
        Volver a Más
      </Link>
    </>
  );
}
