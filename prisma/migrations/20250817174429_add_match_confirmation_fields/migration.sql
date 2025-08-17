-- AlterTable
ALTER TABLE "public"."matches" ADD COLUMN     "mediatorConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "player1Confirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "player2Confirmed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" DROP DEFAULT;
