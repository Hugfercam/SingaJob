"use client";

import { useActionState } from "react";

import {
  createProject,
  type ProjectFormState,
} from "@/lib/clients/actions";

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export function ProjectForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState(
    createProject,
    null as ProjectFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="clientId" value={clientId} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Nombre de la obra
        <input
          name="name"
          type="text"
          required
          autoComplete="off"
          defaultValue={state?.values?.name ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Dirección de la obra
        <input
          name="address"
          type="text"
          autoComplete="street-address"
          defaultValue={state?.values?.address ?? ""}
          className={fieldClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Añadiendo…" : "Añadir obra"}
      </button>
    </form>
  );
}
