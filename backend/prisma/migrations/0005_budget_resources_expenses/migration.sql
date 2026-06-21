-- Release 1.1-C — EVOL-003 budget ressources & dépenses

CREATE TYPE "ResourceType" AS ENUM ('MAIN_OEUVRE', 'MATERIEL', 'SOUS_TRAITANT', 'AUTRE');
CREATE TYPE "ExpenseCategory" AS ENUM ('ACHAT_MATERIAUX', 'LOCATION', 'SOUS_TRAITANCE', 'MAIN_OEUVRE', 'FRAIS_GENERAUX', 'AUTRE');
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'VALIDATED', 'CANCELLED');

ALTER TABLE "Project" ADD COLUMN "budgetAlertAt80" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Project" ADD COLUMN "budgetAlertAt100" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "ProjectResource" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "label" TEXT NOT NULL,
    "unitCost" DECIMAL(12,2) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "totalPlanned" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectResource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectExpense" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "expenseDate" DATE NOT NULL,
    "supplier" TEXT,
    "invoiceReference" TEXT,
    "attachmentUrl" TEXT,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'VALIDATED',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectExpense_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectResource_projectId_idx" ON "ProjectResource"("projectId");
CREATE INDEX "ProjectExpense_projectId_expenseDate_idx" ON "ProjectExpense"("projectId", "expenseDate");
CREATE INDEX "ProjectExpense_projectId_status_idx" ON "ProjectExpense"("projectId", "status");

ALTER TABLE "ProjectResource" ADD CONSTRAINT "ProjectResource_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectResource" ADD CONSTRAINT "ProjectResource_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProjectExpense" ADD CONSTRAINT "ProjectExpense_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectExpense" ADD CONSTRAINT "ProjectExpense_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
