import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { SignatureRule } from "@/components/ui/signature";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Image
          src="/brand/mark.png"
          alt="SignaJob"
          width={56}
          height={56}
          priority
          className="size-14"
        />
        <h1 className="font-display text-3xl leading-tight font-semibold text-ink">
          Entrar
        </h1>
        <SignatureRule />
        <p className="text-sm text-ink-soft">
          Accede con tu email y tu contraseña.
        </p>
      </header>

      <LoginForm />

      <p className="text-sm text-ink-soft">
        ¿Todavía no tienes cuenta?{" "}
        <Link
          className="font-medium text-brand underline underline-offset-4"
          href="/registro"
        >
          Crear una empresa
        </Link>
      </p>
    </main>
  );
}
