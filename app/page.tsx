import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-wide text-emerald-800 uppercase">
          Proyecto en construcción
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">SignaJob</h1>
        <p className="text-pretty text-neutral-600">
          Partes de trabajo con la firma del cliente, desde el móvil del
          técnico. Sin papel, sin llamadas y sin ERP.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          className="rounded-lg bg-emerald-800 px-4 py-2.5 text-center font-medium text-white transition hover:bg-emerald-900"
          href="/registro"
        >
          Crear cuenta de empresa
        </Link>
        <Link
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center font-medium text-neutral-800 transition hover:bg-neutral-100"
          href="/login"
        >
          Entrar
        </Link>
      </div>

      <a
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/api/health"
      >
        Ver estado del sistema
      </a>
    </main>
  );
}
