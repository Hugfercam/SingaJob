"use client";

import { useActionState } from "react";

import { updateCompany, type CompanyState } from "@/lib/company/actions";
import { buttonClass, controlClass, Field } from "@/components/ui/primitives";

const initialState: CompanyState = null;

export function CompanyForm({
  defaultValues,
}: {
  defaultValues: {
    name: string;
    cif: string;
    address: string;
    phone: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    updateCompany,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Nombre de la empresa" htmlFor="name" required>
        <input
          id="name"
          name="name"
          defaultValue={defaultValues.name}
          required
          maxLength={120}
          className={controlClass}
        />
      </Field>

      <Field
        label="CIF"
        htmlFor="cif"
        hint="Aparece en la cabecera del albarán."
      >
        <input
          id="cif"
          name="cif"
          defaultValue={defaultValues.cif}
          maxLength={20}
          className={controlClass}
        />
      </Field>

      <Field label="Dirección" htmlFor="address">
        <input
          id="address"
          name="address"
          defaultValue={defaultValues.address}
          maxLength={160}
          className={controlClass}
        />
      </Field>

      <Field label="Teléfono" htmlFor="phone">
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultValues.phone}
          maxLength={30}
          className={controlClass}
        />
      </Field>

      {state && "error" in state ? (
        <p role="alert" className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      {state && "ok" in state ? (
        <p className="rounded-control bg-brand-soft px-3 py-2 text-sm text-brand">
          Datos guardados.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={buttonClass({ size: "lg", className: "w-full" })}
      >
        {pending ? "Guardando…" : "Guardar datos"}
      </button>
    </form>
  );
}
