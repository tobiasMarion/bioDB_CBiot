/*
  Warnings:

  - Added the required column `minRequiredRoleToEdit` to the `TubeAttribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TubeAttribute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TubeAttribute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tube" ADD COLUMN     "checkedOutAt" TIMESTAMP(3),
ADD COLUMN     "checkedOutBy" TEXT,
ALTER COLUMN "expirationDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TubeAttribute" ADD COLUMN     "minRequiredRoleToEdit" "GroupRole" NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Tube" ADD CONSTRAINT "Tube_checkedOutBy_fkey" FOREIGN KEY ("checkedOutBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
