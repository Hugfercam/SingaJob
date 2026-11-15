import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
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
