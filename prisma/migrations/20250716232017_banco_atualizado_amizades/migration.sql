/*
  Warnings:

  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requesterId,receiverId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `message` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "isRead",
ADD COLUMN     "Read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "message" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Friend_requesterId_receiverId_key" ON "Friend"("requesterId", "receiverId");
