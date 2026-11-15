import type { Metadata } from "next";
import Link from "next/link";

import { AcceptForm } from "@/components/invitations/accept-form";
import { roleLabel } from "@/lib/domain/roles";
import { INVALID_INVITATION_MESSAGE } from "@/lib/invitations/invitation";
import { findInvitationByToken } from "@/lib/invitations/queries";

export const metadata: Metadata = {
  title: "Invitación",
  // Los enlaces de invitación no deben acabar en un buscador.
  robots: { index: false, follow: false },
};

// Depende del token de la URL y de la base de datos.
export const instant = false;

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await findInvitationByToken(token);

  if (!invitation || invitation.status !== "pending") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-4 px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">
          Invitación no válida
        </h1>
        <p className="text-sm text-ink-soft">{INVALID_INVITATION_MESSAGE}</p>
        <Link
          className="text-sm font-medium text-brand underline underline-offset-4"
          href="/login"
        >
          Ir a iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-medium tracking-wide text-brand uppercase">
          {invitation.companyName}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Te han invitado a SignaJob
        </h1>
        <p className="text-sm text-ink-soft">
          Entrarás como {roleLabel(invitation.role).toLowerCase()} con el email{" "}
          <span className="font-medium text-ink">
            {invitation.email}
          </span>
          .
        </p>
      </header>

      <AcceptForm token={token} />
    </main>
  );
}
