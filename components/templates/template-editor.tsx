"use client";

import { useActionState, useState } from "react";

import { saveTemplate, type TemplateFormState } from "@/lib/templates/actions";
import {
  FIELD_TYPES,
  type FieldDefinition,
  type FieldType,
} from "@/lib/work-orders/fields";

const fieldClass =
  "tap w-full rounded-control border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors placeholder:text-ink-soft/70 focus:border-brand";

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
          className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-ink">
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
          <h2 className="text-sm font-semibold tracking-wide text-ink-soft uppercase">
            Campos ({fields.length})
          </h2>
          <button
            type="button"
            onClick={() => setFields((current) => [...current, newField()])}
            className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-line/50"
          >
            Añadir campo
          </button>
        </div>

        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-4 py-4 text-center text-sm text-ink-soft">
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
                  className="flex flex-col gap-2 rounded-lg border border-line px-3 py-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-ink-soft/70">
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
                      className="rounded-lg border border-line px-2 py-2 text-sm text-ink"
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

                  <div className="flex flex-wrap items-center gap-3 text-sm text-ink">
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
                        className="rounded border border-line px-2 py-1 disabled:opacity-40"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, 1)}
                        disabled={index === fields.length - 1}
                        aria-label={`Bajar el campo ${index + 1}`}
                        className="rounded border border-line px-2 py-1 disabled:opacity-40"
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
                        className="rounded border border-line px-2 py-1 text-danger"
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
        className="tap inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-base font-medium text-paper transition-colors hover:bg-brand/90 disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar plantilla"}
      </button>
    </form>
  );
}
