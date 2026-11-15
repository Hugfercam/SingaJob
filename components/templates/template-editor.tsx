"use client";

import { useActionState, useState } from "react";

import { saveTemplate, type TemplateFormState } from "@/lib/templates/actions";
import {
  FIELD_TYPES,
  type FieldDefinition,
  type FieldType,
} from "@/lib/work-orders/fields";

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

const TYPE_LABELS: Record<FieldType, string> = {
  TEXT: "Texto",
  LONG_TEXT: "Texto largo",
  NUMBER: "Número",
  DATE: "Fecha",
  SELECT: "Selección",
  CHECKBOX: "Casilla",
  CHECKLIST: "Lista de comprobación",
};

function newField(): FieldDefinition {
  return {
    id: `f_${Math.random().toString(36).slice(2, 8)}`,
    type: "TEXT",
    label: "",
    required: false,
  };
}

export function TemplateEditor({
  templateId,
  initialName,
  initialDescription,
  initialFields,
}: {
  templateId?: string;
  initialName: string;
  initialDescription: string;
  initialFields: FieldDefinition[];
}) {
  const [state, formAction, pending] = useActionState(
    saveTemplate,
    null as TemplateFormState,
  );
  const [fields, setFields] = useState<FieldDefinition[]>(initialFields);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  function updateField(id: string, patch: Partial<FieldDefinition>) {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    );
  }

  function moveField(index: number, direction: -1 | 1) {
    setFields((current) => {
      const target = index + direction;

      if (target < 0 || target >= current.length) {
        return current;
      }

      const copy = [...current];
      const [item] = copy.splice(index, 1);

      if (item) {
        copy.splice(target, 0, item);
      }

      return copy;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="templateId" value={templateId ?? ""} />
      <input type="hidden" name="fields" value={JSON.stringify(fields)} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Nombre de la plantilla
        <input
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Descripción (opcional)
        <textarea
          name="description"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={fieldClass}
        />
      </label>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-neutral-500 uppercase">
            Campos ({fields.length})
          </h2>
          <button
            type="button"
            onClick={() => setFields((current) => [...current, newField()])}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-100"
          >
            Añadir campo
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-4 text-center text-sm text-neutral-600">
            Todavía no hay campos. Añade el primero.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {fields.map((field, index) => {
              const needsOptions =
                field.type === "SELECT" || field.type === "CHECKLIST";

              return (
                <li
                  key={field.id}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-200 px-3 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-neutral-400">
                      {index + 1}
                    </span>
                    <input
                      value={field.label}
                      onChange={(event) =>
                        updateField(field.id, { label: event.target.value })
                      }
                      placeholder="Etiqueta del campo"
                      aria-label={`Etiqueta del campo ${index + 1}`}
                      className={`${fieldClass} min-w-0 flex-1`}
                    />
                    <select
                      value={field.type}
                      onChange={(event) =>
                        updateField(field.id, {
                          type: event.target.value as FieldType,
                        })
                      }
                      aria-label={`Tipo del campo ${index + 1}`}
                      className="rounded-lg border border-neutral-300 px-2 py-2 text-sm text-neutral-800"
                    >
                      {FIELD_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {needsOptions ? (
                    <input
                      value={(field.options ?? []).join(", ")}
                      onChange={(event) =>
                        updateField(field.id, {
                          options: event.target.value
                            .split(",")
                            .map((option) => option.trim())
                            .filter((option) => option.length > 0),
                        })
                      }
                      placeholder="Opciones separadas por comas"
                      aria-label={`Opciones del campo ${index + 1}`}
                      className={fieldClass}
                    />
                  ) : null}

                  <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(event) =>
                          updateField(field.id, {
                            required: event.target.checked,
                          })
                        }
                        className="size-4"
                      />
                      Obligatorio
                    </label>

                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveField(index, -1)}
                        disabled={index === 0}
                        aria-label={`Subir el campo ${index + 1}`}
                        className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, 1)}
                        disabled={index === fields.length - 1}
                        aria-label={`Bajar el campo ${index + 1}`}
                        className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-40"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFields((current) =>
                            current.filter((item) => item.id !== field.id),
                          )
                        }
                        className="rounded border border-neutral-300 px-2 py-1 text-red-700"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar plantilla"}
      </button>
    </form>
  );
}
