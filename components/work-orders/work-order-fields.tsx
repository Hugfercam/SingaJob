"use client";

import { useActionState } from "react";

import {
  saveWorkOrderValues,
  type ValuesState,
} from "@/lib/work-orders/actions";
import type {
  FieldDefinition,
  WorkOrderValues,
} from "@/lib/work-orders/fields";

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 disabled:bg-neutral-100 disabled:text-neutral-500";

function Control({
  field,
  value,
  disabled,
}: {
  field: FieldDefinition;
  value: WorkOrderValues[string] | undefined;
  disabled: boolean;
}) {
  const name = `field_${field.id}`;

  switch (field.type) {
    case "LONG_TEXT":
      return (
        <textarea
          id={name}
          name={name}
          rows={4}
          disabled={disabled}
          defaultValue={typeof value === "string" ? value : ""}
          className={fieldClass}
        />
      );

    case "NUMBER":
      return (
        <input
          id={name}
          name={name}
          type="number"
          step="any"
          inputMode="decimal"
          disabled={disabled}
          defaultValue={typeof value === "number" ? value : ""}
          className={fieldClass}
        />
      );

    case "DATE":
      return (
        <input
          id={name}
          name={name}
          type="date"
          disabled={disabled}
          defaultValue={typeof value === "string" ? value : ""}
          className={fieldClass}
        />
      );

    case "SELECT":
      return (
        <select
          id={name}
          name={name}
          disabled={disabled}
          defaultValue={typeof value === "string" ? value : ""}
          className={fieldClass}
        >
          <option value="">— Elige —</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case "CHECKBOX":
      return (
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            id={name}
            name={name}
            type="checkbox"
            disabled={disabled}
            defaultChecked={value === true}
            className="size-4"
          />
          Sí
        </label>
      );

    case "CHECKLIST": {
      const checked = Array.isArray(value) ? value : [];

      return (
        <ul className="flex flex-col gap-1">
          {(field.options ?? []).map((option) => (
            <li key={option}>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  name={name}
                  type="checkbox"
                  value={option}
                  disabled={disabled}
                  defaultChecked={checked.includes(option)}
                  className="size-4"
                />
                {option}
              </label>
            </li>
          ))}
        </ul>
      );
    }

    default:
      return (
        <input
          id={name}
          name={name}
          type="text"
          disabled={disabled}
          defaultValue={typeof value === "string" ? value : ""}
          className={fieldClass}
        />
      );
  }
}

export function WorkOrderFields({
  workOrderId,
  fields,
  values,
  readOnly,
}: {
  workOrderId: string;
  fields: FieldDefinition[];
  values: WorkOrderValues;
  readOnly: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    saveWorkOrderValues,
    null as ValuesState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="workOrderId" value={workOrderId} />

      {state?.status === "error" ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      {state?.status === "saved" ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Guardado.
        </p>
      ) : null}

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-4 text-center text-sm text-neutral-600">
          Este parte no tiene campos: se creó sin plantilla.
        </p>
      ) : null}

      {fields.map((field) => {
        const fieldErrors = state?.status === "error" ? state.errors : undefined;
        const error = fieldErrors?.[field.id];

        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label
              htmlFor={`field_${field.id}`}
              className="text-sm font-medium text-neutral-800"
            >
              {field.label}
              {field.required ? (
                <span className="ml-0.5 text-red-700" aria-hidden="true">
                  *
                </span>
              ) : null}
            </label>

            <Control field={field} value={values[field.id]} disabled={readOnly} />

            {field.help ? (
              <p className="text-xs text-neutral-500">{field.help}</p>
            ) : null}

            {error ? (
              <p className="text-xs text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}

      {readOnly ? null : (
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
      )}
    </form>
  );
}
