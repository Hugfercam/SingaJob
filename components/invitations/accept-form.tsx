"use client";

import { useActionState } from "react";

import { acceptInvitation, type AcceptState } from "@/lib/invitations/actions";

const initialState: AcceptState = null;

const fieldClass =
  "tap w-full rounded-control border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand";

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
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Elige una contraseña
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={10}
          required
          className={fieldClass}
        />
        <span className="text-xs font-normal text-ink-soft">
          Al menos 10 caracteres.
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 tap inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-base font-medium text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Aceptar invitación y entrar"}
      </button>
    </form>
  );
}
