/*
  Warnings:

  - You are about to drop the column `archived` on the `Box` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `Freezer` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `GroupInvite` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `GroupMembership` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `Sample` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `SampleShare` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `Tube` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `TubeAttribute` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `TubeEvent` table. All the data in the column will be lost.
  - You are about to drop the column `archived` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Box" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Freezer" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GroupInvite" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GroupMembership" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Sample" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SampleShare" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tube" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TubeAttribute" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TubeEvent" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "archived",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
