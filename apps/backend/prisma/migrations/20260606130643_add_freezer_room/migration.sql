/*
  Warnings:

  - You are about to drop the column `locationDescription` on the `Freezer` table. All the data in the column will be lost.
  - Added the required column `roomId` to the `Freezer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Freezer" DROP COLUMN "locationDescription",
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Freezer" ADD CONSTRAINT "Freezer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
