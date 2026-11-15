"use client";

import { useActionState } from "react";

import { login, type AuthState } from "@/lib/auth/actions";
import { buttonClass, controlClass } from "@/components/ui/primitives";

const initialState: AuthState = null;

const fieldClass = controlClass;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

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
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state?.values?.email ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className={buttonClass({ size: "lg", className: "mt-2 w-full" })}
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
