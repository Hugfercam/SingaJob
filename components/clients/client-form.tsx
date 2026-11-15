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
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Teléfono
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={state?.values?.phone ?? defaults?.phone ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Email
        <input
          name="email"
          type="email"
          inputMode="email"
          defaultValue={state?.values?.email ?? defaults?.email ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Dirección
        <input
          name="address"
          type="text"
          autoComplete="street-address"
          defaultValue={state?.values?.address ?? defaults?.address ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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
        className="mt-2 tap inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-base font-medium text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
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
