-- CreateEnum
CREATE TYPE "AttachmentKind" AS ENUM ('PHOTO', 'SIGNATURE_CLIENT', 'SIGNATURE_TECHNICIAN');

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "endLatitude" DOUBLE PRECISION,
ADD COLUMN     "endLongitude" DOUBLE PRECISION,
ADD COLUMN     "startLatitude" DOUBLE PRECISION,
ADD COLUMN     "startLongitude" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "kind" "AttachmentKind" NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attachments_storageKey_key" ON "attachments"("storageKey");

-- CreateIndex
CREATE INDEX "attachments_workOrderId_kind_idx" ON "attachments"("workOrderId", "kind");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
