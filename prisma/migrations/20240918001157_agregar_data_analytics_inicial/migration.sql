-- CreateTable
CREATE TABLE "DataAnalytics" (
    "id" TEXT NOT NULL,
    "materialID" TEXT NOT NULL,
    "materialName" TEXT NOT NULL,
    "totalQuantityUsed" INTEGER NOT NULL,
    "totalQuantityPurchased" INTEGER NOT NULL,
    "lastPurchasedDate" TIMESTAMP(3) NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedDataId" TEXT NOT NULL,

    CONSTRAINT "DataAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataAnalytics_processedDataId_key" ON "DataAnalytics"("processedDataId");

-- AddForeignKey
ALTER TABLE "DataAnalytics" ADD CONSTRAINT "DataAnalytics_processedDataId_fkey" FOREIGN KEY ("processedDataId") REFERENCES "ProcessedData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
