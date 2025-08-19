-- CreateTable
CREATE TABLE "public"."player_statistics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameSlug" TEXT NOT NULL,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "winsWO" INTEGER NOT NULL DEFAULT 0,
    "lossesWO" INTEGER NOT NULL DEFAULT 0,
    "kills" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "caps" INTEGER NOT NULL DEFAULT 0,
    "matchesWithKills" INTEGER NOT NULL DEFAULT 0,
    "matchesWithAssists" INTEGER NOT NULL DEFAULT 0,
    "matchesWithCaps" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."match_statistics" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "player1Kills" INTEGER,
    "player1Assists" INTEGER,
    "player1Caps" INTEGER,
    "player2Kills" INTEGER,
    "player2Assists" INTEGER,
    "player2Caps" INTEGER,
    "completedBy" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_statistics_userId_gameSlug_key" ON "public"."player_statistics"("userId", "gameSlug");

-- CreateIndex
CREATE UNIQUE INDEX "match_statistics_matchId_key" ON "public"."match_statistics"("matchId");

-- AddForeignKey
ALTER TABLE "public"."player_statistics" ADD CONSTRAINT "player_statistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_statistics" ADD CONSTRAINT "match_statistics_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
