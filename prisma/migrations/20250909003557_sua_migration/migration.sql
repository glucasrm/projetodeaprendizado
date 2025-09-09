/*
  Warnings:

  - You are about to drop the column `game` on the `tournaments` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `tournaments` table. All the data in the column will be lost.
  - Added the required column `gameSlug` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxTeams` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mode` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platform` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationEndsAt` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startsAt` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamSize` to the `tournaments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tournaments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."tournaments" DROP COLUMN "game",
DROP COLUMN "startDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "gameSlug" TEXT NOT NULL,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "maxTeams" INTEGER NOT NULL,
ADD COLUMN     "mode" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "platform" TEXT NOT NULL,
ADD COLUMN     "prizePool" TEXT,
ADD COLUMN     "registrationEndsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "rules" TEXT,
ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "teamSize" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tournament_rounds" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_rounds_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tournaments" ADD CONSTRAINT "tournaments_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tournament_rounds" ADD CONSTRAINT "tournament_rounds_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
