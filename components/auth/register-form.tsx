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
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Contraseña
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
        className={buttonClass({ size: "lg", className: "mt-2 w-full" })}
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
