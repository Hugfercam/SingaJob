import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Entrar en SignaJob
        </h1>
        <p className="text-sm text-neutral-600">
          Accede con tu email y tu contraseña.
        </p>
      </header>

      <LoginForm />

      <p className="text-sm text-neutral-600">
        ¿Todavía no tienes cuenta?{" "}
        <Link
          className="font-medium text-emerald-800 underline underline-offset-4"
          href="/registro"
        >
          Crear una empresa
        </Link>
      </p>
    </main>
  );
}
