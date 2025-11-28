-- CreateEnum
CREATE TYPE "SnapshotKind" AS ENUM ('initial', 'before_action', 'after_action');

-- AlterTable
ALTER TABLE "GameAction" ADD COLUMN     "rngRolls" JSONB,
ADD COLUMN     "stateAfter" JSONB,
ADD COLUMN     "stateBefore" JSONB;

-- CreateTable
CREATE TABLE "GameStateSnapshot" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "status" "GameStatus" NOT NULL,
    "currentPlayerId" INTEGER NOT NULL,
    "availableActions" JSONB,
    "rngSeed" TEXT,
    "kind" "SnapshotKind" NOT NULL DEFAULT 'before_action',
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameStateSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameStateSnapshot_gameId_turnNumber_kind_idx" ON "GameStateSnapshot"("gameId", "turnNumber", "kind");

-- AddForeignKey
ALTER TABLE "GameStateSnapshot" ADD CONSTRAINT "GameStateSnapshot_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
