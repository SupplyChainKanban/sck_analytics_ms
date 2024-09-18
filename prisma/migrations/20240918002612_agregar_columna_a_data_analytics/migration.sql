/*
  Warnings:

  - Added the required column `processedDate` to the `DataAnalytics` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `materialID` on the `DataAnalytics` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DataAnalytics" ADD COLUMN     "processedDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "materialID",
ADD COLUMN     "materialID" INTEGER NOT NULL;
