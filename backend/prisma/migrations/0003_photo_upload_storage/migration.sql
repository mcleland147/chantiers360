-- Release 1.1-A — EVOL-001 upload réel photos

ALTER TABLE "Photo" ADD COLUMN "originalFileName" TEXT;
ALTER TABLE "Photo" ADD COLUMN "storageKey" TEXT;
ALTER TABLE "Photo" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "Photo" ADD COLUMN "fileSizeBytes" INTEGER;
ALTER TABLE "Photo" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Photo" ADD COLUMN "deletedById" TEXT;

UPDATE "Photo" SET
  "originalFileName" = "fileName",
  "storageKey" = 'legacy/' || "id",
  "mimeType" = 'image/jpeg',
  "fileSizeBytes" = 0
WHERE "originalFileName" IS NULL;

ALTER TABLE "Photo" ALTER COLUMN "originalFileName" SET NOT NULL;
ALTER TABLE "Photo" ALTER COLUMN "storageKey" SET NOT NULL;
ALTER TABLE "Photo" ALTER COLUMN "mimeType" SET NOT NULL;
ALTER TABLE "Photo" ALTER COLUMN "fileSizeBytes" SET NOT NULL;

CREATE UNIQUE INDEX "Photo_storageKey_key" ON "Photo"("storageKey");
CREATE INDEX "Photo_projectId_deletedAt_idx" ON "Photo"("projectId", "deletedAt");
CREATE INDEX "Photo_projectId_category_idx" ON "Photo"("projectId", "category");

ALTER TABLE "Photo" ADD CONSTRAINT "Photo_addedById_fkey"
  FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
