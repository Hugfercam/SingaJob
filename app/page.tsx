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

      <p className="text-sm text-neutral-500">
        Esta es la base del proyecto: la aplicación, el acceso a datos y la
        instalación como PWA ya funcionan. Las pantallas de trabajo llegan en
        las próximas tareas.
      </p>

      <a
        className="text-sm font-medium text-emerald-800 underline underline-offset-4"
        href="/api/health"
      >
        Ver estado del sistema
      </a>
    </main>
  );
}
