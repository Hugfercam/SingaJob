"use client";

import { useActionState } from "react";

import {
  createProject,
  type ProjectFormState,
} from "@/lib/clients/actions";

const fieldClass =
  "tap w-full rounded-control border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand";

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
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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
        className="tap inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-base font-medium text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
      >
        {pending ? "Añadiendo…" : "Añadir obra"}
      </button>
    </form>
  );
}
