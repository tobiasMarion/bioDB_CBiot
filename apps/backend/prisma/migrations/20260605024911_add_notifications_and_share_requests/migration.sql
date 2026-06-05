-- AlterEnum
ALTER TYPE "AuditEntityType" ADD VALUE 'ROOM';

-- AlterTable
ALTER TABLE "Tube" ADD COLUMN     "daysBeforeNotification" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleShareRequest" (
    "id" TEXT NOT NULL,
    "sampleId" TEXT NOT NULL,
    "targetGroupId" TEXT NOT NULL,
    "permission" "SamplePermission" NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "SampleShareRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TubeExpirationNotification" (
    "id" TEXT NOT NULL,
    "tubeId" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TubeExpirationNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TubeExpirationNotificationRecipient" (
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TubeExpirationNotificationRecipient_pkey" PRIMARY KEY ("notificationId","userId")
);

-- CreateIndex
CREATE INDEX "SampleShareRequest_targetGroupId_idx" ON "SampleShareRequest"("targetGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleShareRequest_sampleId_targetGroupId_key" ON "SampleShareRequest"("sampleId", "targetGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "TubeExpirationNotification_tubeId_key" ON "TubeExpirationNotification"("tubeId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleShareRequest" ADD CONSTRAINT "SampleShareRequest_sampleId_fkey" FOREIGN KEY ("sampleId") REFERENCES "Sample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleShareRequest" ADD CONSTRAINT "SampleShareRequest_targetGroupId_fkey" FOREIGN KEY ("targetGroupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleShareRequest" ADD CONSTRAINT "SampleShareRequest_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TubeExpirationNotification" ADD CONSTRAINT "TubeExpirationNotification_tubeId_fkey" FOREIGN KEY ("tubeId") REFERENCES "Tube"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TubeExpirationNotificationRecipient" ADD CONSTRAINT "TubeExpirationNotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "TubeExpirationNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TubeExpirationNotificationRecipient" ADD CONSTRAINT "TubeExpirationNotificationRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
