/*
  Warnings:

  - You are about to drop the `DataAnalytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessedData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DataAnalytics" DROP CONSTRAINT "DataAnalytics_processedDataId_fkey";

-- DropTable
DROP TABLE "DataAnalytics";

-- DropTable
DROP TABLE "ProcessedData";

-- CreateTable
CREATE TABLE "processedData" (
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

    CONSTRAINT "processedData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataAnalytics" (
    "id" TEXT NOT NULL,
    "materialID" INTEGER NOT NULL,
    "materialName" TEXT NOT NULL,
    "totalQuantityUsed" INTEGER NOT NULL,
    "totalQuantityPurchased" INTEGER NOT NULL,
    "lastPurchasedDate" TIMESTAMP(3) NOT NULL,
    "processedDate" TIMESTAMP(3) NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDataId" TEXT NOT NULL,

    CONSTRAINT "dataAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dataAnalytics_processedDataId_key" ON "dataAnalytics"("processedDataId");

-- AddForeignKey
ALTER TABLE "dataAnalytics" ADD CONSTRAINT "dataAnalytics_processedDataId_fkey" FOREIGN KEY ("processedDataId") REFERENCES "processedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
