import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AttachmentGallery } from "@/components/work-orders/attachment-gallery";
import { PdfActions } from "@/components/work-orders/pdf-actions";
import { PhotoUpload } from "@/components/work-orders/photo-upload";
import { SignaturePad } from "@/components/work-orders/signature-pad";
import { StatusTrail } from "@/components/work-orders/status-trail";
import { WorkOrderFields } from "@/components/work-orders/work-order-fields";
import { WorkOrderStatusButtons } from "@/components/work-orders/work-order-status-buttons";
import {
  Card,
  SectionTitle,
  StatusBadge,
  type Tone,
} from "@/components/ui/primitives";
import { requireSession } from "@/lib/auth/guards";
import { workOrderStatusLabel } from "@/lib/domain/work-orders";
import { Role, type WorkOrderStatus } from "@/lib/generated/prisma/client";
import { formatCoordinates } from "@/lib/work-orders/format";
import { getWorkOrder } from "@/lib/work-orders/queries";

export const metadata: Metadata = {
  title: "Parte",
};

// Depende de la sesión: nunca se prerenderiza.
export const instant = false;

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const TONE: Record<WorkOrderStatus, Tone> = {
  PENDING: "neutral",
  IN_PROGRESS: "active",
  COMPLETED: "done",
  CANCELLED: "danger",
};

export default async function WorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireSession();
  const { id } = await params;

  const viewer = { role: auth.user.role, userId: auth.user.id };
  const workOrder = await getWorkOrder(auth.company.id, id, viewer);

  if (!workOrder) {
    notFound();
  }

  const isOffice =
    auth.user.role === Role.ADMIN || auth.user.role === Role.MANAGER;
  const isClosed =
    workOrder.status === "COMPLETED" || workOrder.status === "CANCELLED";

  const photos = workOrder.attachments.filter((item) => item.kind === "PHOTO");
  const hasClientSignature = workOrder.attachments.some(
    (item) => item.kind === "SIGNATURE_CLIENT",
  );
  const hasTechnicianSignature = workOrder.attachments.some(
    (item) => item.kind === "SIGNATURE_TECHNICIAN",
  );

  const startCoords = formatCoordinates(
    workOrder.startCoordinates?.latitude ?? null,
    workOrder.startCoordinates?.longitude ?? null,
  );
  const endCoords = formatCoordinates(
    workOrder.endCoordinates?.latitude ?? null,
    workOrder.endCoordinates?.longitude ?? null,
  );

  return (
    <>
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl leading-tight font-semibold text-ink">
            {workOrder.title}
          </h1>
          <StatusBadge tone={TONE[workOrder.status]}>
            {workOrderStatusLabel(workOrder.status)}
          </StatusBadge>
        </div>
        <p className="text-sm text-ink-soft">
          {workOrder.clientName}
          {workOrder.projectName ? ` · ${workOrder.projectName}` : ""}
        </p>
      </header>

      <Card className="flex flex-col gap-3 px-4 py-4">
        <StatusTrail status={workOrder.status} />
      </Card>

      <Card className="flex flex-col divide-y divide-line text-sm">
        {[
          { label: "Dirección", value: workOrder.clientAddress },
          { label: "Asignado a", value: workOrder.assigneeName ?? "sin asignar" },
          { label: "Plantilla", value: workOrder.templateName ?? "sin plantilla" },
          { label: "Creado", value: dateFormat.format(workOrder.createdAt) },
          workOrder.completedAt
            ? {
                label: "Completado",
                value: dateFormat.format(workOrder.completedAt),
              }
            : null,
          startCoords ? { label: "GPS inicio", value: startCoords } : null,
          endCoords ? { label: "GPS fin", value: endCoords } : null,
        ]
          .filter((row): row is { label: string; value: string } => row !== null)
          .map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 px-4 py-2 first:pt-3 last:pb-3"
            >
              <span className="text-ink-soft">{row.label}</span>
              <span className="tabular text-right text-ink">{row.value}</span>
            </div>
          ))}
      </Card>

      {isClosed ? (
        <Card className="px-4 py-3 text-sm text-ink-soft">
          {workOrder.status === "CANCELLED"
            ? "Este parte está cancelado y no se puede modificar."
            : "Este parte está cerrado. Ya no se puede modificar."}
        </Card>
      ) : (
        <WorkOrderStatusButtons
          workOrderId={workOrder.id}
          status={workOrder.status}
          canCancel={isOffice}
          withLocation
        />
      )}

      <section className="flex flex-col gap-3">
        <SectionTitle>Campos del parte</SectionTitle>
        <Card className="px-4 py-4">
          <WorkOrderFields
            workOrderId={workOrder.id}
            fields={workOrder.fields}
            values={workOrder.values}
            readOnly={isClosed}
          />
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle
          action={
            photos.length > 0 ? (
              <span className="text-sm text-ink-soft">{photos.length}</span>
            ) : null
          }
        >
          Fotos
        </SectionTitle>

        <AttachmentGallery
          workOrderId={workOrder.id}
          attachments={photos}
        />

        {isClosed ? null : (
          <PhotoUpload workOrderId={workOrder.id} disabled={isClosed} />
        )}
      </section>

      {isClosed ? null : (
        <section className="flex flex-col gap-3">
          <SectionTitle>Firmas</SectionTitle>

          {hasClientSignature ? (
            <AttachmentGallery
              workOrderId={workOrder.id}
              attachments={workOrder.attachments.filter(
                (item) => item.kind === "SIGNATURE_CLIENT",
              )}
            />
          ) : (
            <Card className="px-4 py-4">
              <SignaturePad
                workOrderId={workOrder.id}
                kind="SIGNATURE_CLIENT"
                title="Firma del cliente"
              />
            </Card>
          )}

          {hasTechnicianSignature ? (
            <AttachmentGallery
              workOrderId={workOrder.id}
              attachments={workOrder.attachments.filter(
                (item) => item.kind === "SIGNATURE_TECHNICIAN",
              )}
            />
          ) : (
            <Card className="px-4 py-4">
              <SignaturePad
                workOrderId={workOrder.id}
                kind="SIGNATURE_TECHNICIAN"
                title="Firma del técnico"
              />
            </Card>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <SectionTitle>Albarán</SectionTitle>

        {workOrder.status === "COMPLETED" ? (
          <PdfActions workOrderId={workOrder.id} title={workOrder.title} />
        ) : (
          <p className="text-sm text-ink-soft">
            El albarán se puede descargar cuando el parte esté completado.
          </p>
        )}
      </section>

      <Link
        href="/partes"
        className="text-sm font-medium text-brand underline underline-offset-4"
      >
        Volver a partes
      </Link>
    </>
  );
}
