"use client";

import { useActionState } from "react";

import { registerCompany, type AuthState } from "@/lib/auth/actions";
import { buttonClass, controlClass } from "@/components/ui/primitives";

const initialState: AuthState = null;

const fieldClass = controlClass;

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerCompany,
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
        Nombre de la empresa
        <input
          name="companyName"
          type="text"
          autoComplete="organization"
          required
          defaultValue={state?.values?.companyName ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
        Tu nombre
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={state?.values?.name ?? ""}
          className={fieldClass}
        />
      </label>

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
        className={buttonClass({ size: "lg", className: "mt-2 w-full" })}
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
