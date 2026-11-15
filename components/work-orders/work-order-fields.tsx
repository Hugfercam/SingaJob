"use client";

import { useState } from "react";

import type {
  FieldDefinition,
  WorkOrderValues,
} from "@/lib/work-orders/fields";
import { submit } from "@/lib/offline/submit";

const fieldClass =
  "tap w-full rounded-control border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand disabled:bg-line/40 disabled:text-ink-soft";

type State =
  | { status: "idle" | "saving" }
  | { status: "saved" }
  | { status: "queued" }
  | { status: "rejected"; error: string; errors?: Record<string, string> };

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
        <label className="flex items-center gap-2 text-sm text-ink">
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
              <label className="flex items-center gap-2 text-sm text-ink">
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
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const raw: Record<string, unknown> = {};

    for (const field of fields) {
      const name = `field_${field.id}`;

      if (field.type === "CHECKBOX") {
        raw[field.id] = formData.get(name) === "on";
      } else if (field.type === "CHECKLIST") {
        raw[field.id] = formData
          .getAll(name)
          .filter((value): value is string => typeof value === "string");
      } else {
        raw[field.id] = String(formData.get(name) ?? "");
      }
    }

    setState({ status: "saving" });

    const result = await submit({
      url: `/api/partes/${workOrderId}/valores`,
      body: { kind: "json", data: { values: raw } },
      label: "campos del parte",
    });

    if (result.status === "saved") {
      setState({ status: "saved" });
    } else if (result.status === "queued") {
      setState({ status: "queued" });
    } else {
      setState({
        status: "rejected",
        error: result.error,
        errors: result.errors,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {state.status === "rejected" ? (
        <p
          role="alert"
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {state.status === "saved" ? (
        <p className="rounded-lg bg-brand-soft/60 px-3 py-2 text-sm text-brand">
          Guardado.
        </p>
      ) : null}

      {state.status === "queued" ? (
        <p className="rounded-lg bg-warn/10 px-3 py-2 text-sm text-warn">
          Guardado en el dispositivo. Se enviará al recuperar la conexión.
        </p>
      ) : null}

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-4 py-4 text-center text-sm text-ink-soft">
          Este parte no tiene campos: se creó sin plantilla.
        </p>
      ) : null}

      {fields.map((field) => {
        const error =
          state.status === "rejected" ? state.errors?.[field.id] : undefined;

        return (
          <div key={field.id} className="flex flex-col gap-1">
            <label
              htmlFor={`field_${field.id}`}
              className="text-sm font-medium text-ink"
            >
              {field.label}
              {field.required ? (
                <span className="ml-0.5 text-danger" aria-hidden="true">
                  *
                </span>
              ) : null}
            </label>

            <Control field={field} value={values[field.id]} disabled={readOnly} />

            {field.help ? (
              <p className="text-xs text-ink-soft">{field.help}</p>
            ) : null}

            {error ? (
              <p className="text-xs text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}

      {readOnly ? null : (
        <button
          type="submit"
          disabled={state.status === "saving"}
          className="tap inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-base font-medium text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
        >
          {state.status === "saving" ? "Guardando…" : "Guardar"}
        </button>
      )}
    </form>
  );
}
