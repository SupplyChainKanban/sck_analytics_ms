-- CreateEnum
CREATE TYPE "ProcessedDataStatus" AS ENUM ('PENDING', 'PROCESSED');

-- CreateEnum
CREATE TYPE "ProcessedDataPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "SourceTypes" AS ENUM ('MES', 'MANUAL', 'PROJECT');

-- CreateTable
CREATE TABLE "ProcessedData" (
    "id" TEXT NOT NULL,
    "rawDataId" TEXT NOT NULL,
    "sourceType" "SourceTypes" NOT NULL,
    "materialID" INTEGER NOT NULL,
    "materialCategory" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "processedQuantity" INTEGER NOT NULL,
    "processedDate" TIMESTAMP(3) NOT NULL,
    "purchaseID" INTEGER,
    "remainingStock" INTEGER,
    "unitOfMeasure" TEXT,
    "costPerUnit" DOUBLE PRECISION,
    "projectID" INTEGER,
    "budgetAllocated" DOUBLE PRECISION,
    "priority" "ProcessedDataPriority" NOT NULL,
    "status" "ProcessedDataStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessedData_pkey" PRIMARY KEY ("id")
);
