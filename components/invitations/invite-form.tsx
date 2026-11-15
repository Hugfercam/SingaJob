"use client";

import { useActionState, useState } from "react";

import { inviteEmployee, type InviteState } from "@/lib/invitations/actions";

const initialState: InviteState = null;

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

type RoleOption = { value: string; label: string };

export function InviteForm({
  roleOptions,
  origin,
}: {
  roleOptions: RoleOption[];
  origin: string;
}) {
  const [state, formAction, pending] = useActionState(
    inviteEmployee,
    initialState,
  );
  const [copied, setCopied] = useState(false);

  const successState = state?.status === "ok" ? state : null;
  const absoluteLink = successState?.link
    ? `${origin}${successState.link}`
    : null;

  async function copyLink() {
    if (!absoluteLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(absoluteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state?.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </p>
      ) : null}

      {state?.status === "ok" ? (
        <div className="flex flex-col gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <p>{state.message}</p>
          {absoluteLink ? (
            <>
              <code className="break-all rounded bg-white px-2 py-1 text-xs text-neutral-700">
                {absoluteLink}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="self-start rounded-lg border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
              >
                {copied ? "Copiado" : "Copiar enlace"}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Email del empleado
        <input
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          required
          defaultValue={state?.email ?? ""}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Rol
        <select name="role" defaultValue="TECHNICIAN" className={fieldClass}>
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Creando enlace…" : "Crear enlace de invitación"}
      </button>
    </form>
  );
}
