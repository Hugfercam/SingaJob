"use client";

import { useActionState, useState } from "react";

import { inviteEmployee, type InviteState } from "@/lib/invitations/actions";

const initialState: InviteState = null;

const fieldClass =
  "tap w-full rounded-control border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand";

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
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.message}
        </p>
      ) : null}

      {state?.status === "ok" ? (
        <div className="flex flex-col gap-2 rounded-lg bg-brand-soft/60 px-3 py-2 text-sm text-brand">
          <p>{state.message}</p>
          {absoluteLink ? (
            <>
              <code className="break-all rounded bg-surface px-2 py-1 text-xs text-ink">
                {absoluteLink}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="self-start tap rounded-control border border-brand px-3 py-1.5 text-sm font-medium text-brand transition-colors hover:bg-brand-soft"
              >
                {copied ? "Copiado" : "Copiar enlace"}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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
        className="tap inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-base font-medium text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
      >
        {pending ? "Creando enlace…" : "Crear enlace de invitación"}
      </button>
    </form>
  );
}
