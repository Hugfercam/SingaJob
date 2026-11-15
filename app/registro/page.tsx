import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Image
          src="/brand/mark.png"
          alt="SignaJob"
          width={48}
          height={48}
          priority
          className="size-12"
        />
        <h1 className="font-display text-2xl leading-tight font-semibold text-ink">
          Crea tu empresa en SignaJob
        </h1>
        <p className="text-sm text-ink-soft">
          Serás el administrador. Podrás invitar a tu equipo después.
        </p>
      </header>

      <RegisterForm />

      <p className="text-sm text-ink-soft">
        ¿Ya tienes cuenta?{" "}
        <Link
          className="font-medium text-brand underline underline-offset-4"
          href="/login"
        >
          Iniciar sesión
        </Link>
      </p>
    </main>
  );
}
