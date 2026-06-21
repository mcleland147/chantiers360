-- Release 1.1-B — EVOL-002 planning ouvriers (ADR-001)

CREATE TYPE "ScheduleStatus" AS ENUM ('PLANNED', 'CONFIRMED', 'CANCELLED');

CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "trade" TEXT,
    "hourlyRate" DECIMAL(10,2),
    "dailyRate" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");
CREATE INDEX "Worker_isActive_idx" ON "Worker"("isActive");
CREATE INDEX "Worker_lastName_firstName_idx" ON "Worker"("lastName", "firstName");

CREATE TABLE "WorkerSchedule" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerSchedule_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "WorkerSchedule" ADD CONSTRAINT "WorkerSchedule_workerId_fkey"
  FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WorkerSchedule" ADD CONSTRAINT "WorkerSchedule_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkerSchedule" ADD CONSTRAINT "WorkerSchedule_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "WorkerSchedule_workerId_startAt_endAt_idx" ON "WorkerSchedule"("workerId", "startAt", "endAt");
CREATE INDEX "WorkerSchedule_projectId_startAt_idx" ON "WorkerSchedule"("projectId", "startAt");
CREATE INDEX "WorkerSchedule_startAt_endAt_idx" ON "WorkerSchedule"("startAt", "endAt");
