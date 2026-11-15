"use client";

import { useActionState } from "react";

import { controlClass } from "@/components/ui/primitives";
import {
  createClient,
  updateClient,
  type ClientFormState,
} from "@/lib/clients/actions";

const fieldClass = controlClass;

type Defaults = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

export function ClientForm({
  mode,
  clientId,
  defaults,
}: {
  mode: "create" | "edit";
  clientId?: string;
  defaults?: Defaults;
}) {
  const action = mode === "create" ? createClient : updateClient;
  const [state, formAction, pending] = useActionState(
    action,
    null as ClientFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {clientId ? (
        <input type="hidden" name="clientId" value={clientId} />
      ) : null}

      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Nombre
        <input
          name="name"
          type="text"
          required
          autoComplete="off"
          defaultValue={state?.values?.name ?? defaults?.name ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Teléfono
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={state?.values?.phone ?? defaults?.phone ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Email
        <input
          name="email"
          type="email"
          inputMode="email"
          defaultValue={state?.values?.email ?? defaults?.email ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Dirección
        <input
          name="address"
          type="text"
          autoComplete="street-address"
          defaultValue={state?.values?.address ?? defaults?.address ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Notas
        <textarea
          name="notes"
          rows={3}
          defaultValue={state?.values?.notes ?? defaults?.notes ?? ""}
          className={fieldClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending
          ? "Guardando…"
          : mode === "create"
            ? "Crear cliente"
            : "Guardar cambios"}
      </button>
    </form>
  );
}
