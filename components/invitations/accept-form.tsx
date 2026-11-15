"use client";

import { useActionState } from "react";

import { acceptInvitation, type AcceptState } from "@/lib/invitations/actions";

const initialState: AcceptState = null;

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

export function AcceptForm({ token }: { token: string }) {
  // El token viaja fijado al servidor: no se puede manipular desde la página.
  const boundAction = acceptInvitation.bind(null, token);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Tu nombre
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={state?.name ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Elige una contraseña
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className={fieldClass}
        />
        <span className="text-xs font-normal text-neutral-500">
          Al menos 10 caracteres.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Aceptar invitación y entrar"}
      </button>
    </form>
  );
}
