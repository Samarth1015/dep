/*
  Warnings:

  - A unique constraint covering the columns `[accessKeyID]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[secretAccesskeyId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessKeyID` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secretAccesskeyId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessKeyID" TEXT NOT NULL,
ADD COLUMN     "secretAccesskeyId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_accessKeyID_key" ON "User"("accessKeyID");

-- CreateIndex
CREATE UNIQUE INDEX "User_secretAccesskeyId_key" ON "User"("secretAccesskeyId");
