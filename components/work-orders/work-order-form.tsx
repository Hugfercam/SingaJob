"use client";

import { useActionState, useState } from "react";

import {
  createWorkOrder,
  type CreateWorkOrderState,
} from "@/lib/work-orders/actions";

const fieldClass =
  "rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

type Option = { id: string; name: string };

export function WorkOrderForm({
  clients,
  projects,
  templates,
  users,
}: {
  clients: Option[];
  projects: { id: string; name: string; clientId: string }[];
  templates: Option[];
  users: { id: string; name: string; role: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createWorkOrder,
    null as CreateWorkOrderState,
  );
  const [clientId, setClientId] = useState("");

  const availableProjects = clientId
    ? projects.filter((project) => project.clientId === clientId)
    : [];

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
        Título del parte
        <input
          name="title"
          type="text"
          required
          placeholder="Reforma de baño, revisión de caldera…"
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Cliente
        <select
          name="clientId"
          required
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
          className={fieldClass}
        >
          <option value="">— Elige —</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Obra (opcional)
        <select
          name="projectId"
          defaultValue=""
          disabled={availableProjects.length === 0}
          className={fieldClass}
        >
          <option value="">
            {clientId
              ? "Sin obra concreta"
              : "Elige primero un cliente"}
          </option>
          {availableProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Plantilla
        <select name="templateId" defaultValue="" className={fieldClass}>
          <option value="">Sin plantilla</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <span className="text-xs font-normal text-neutral-500">
          Los campos del parte se copian de la plantilla al crearlo.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Asignar a
        <select name="assignedToId" defaultValue="" className={fieldClass}>
          <option value="">Sin asignar</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-emerald-800 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-900 disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear parte"}
      </button>
    </form>
  );
}
