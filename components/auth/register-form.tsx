"use client";

import { useActionState } from "react";

import { registerCompany, type AuthState } from "@/lib/auth/actions";

const initialState: AuthState = null;

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

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
        className="mt-2 rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
