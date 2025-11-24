-- CreateEnum
CREATE TYPE "TerrainType" AS ENUM ('plain', 'forest', 'hill', 'water', 'city', 'swamp', 'road', 'bridge', 'ford');

-- CreateEnum
CREATE TYPE "UnitName" AS ENUM ('light_infantry', 'line_infantry', 'guard_infantry', 'light_cavalry', 'dragon_cavalry', 'heavy_cavalry', 'twelve_pounder_cannon', 'six_pounder_cannon', 'howitzer_cannon');

-- CreateEnum
CREATE TYPE "GamePhase" AS ENUM ('created', 'deployment', 'battle', 'finished');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "budget" INTEGER NOT NULL DEFAULT 1000,
    "turn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "phase" "GamePhase" NOT NULL DEFAULT 'created',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playerId" INTEGER NOT NULL,
    "enemyId" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 30,
    "height" INTEGER NOT NULL DEFAULT 30,
    "seed" INTEGER,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tile" (
    "id" SERIAL NOT NULL,
    "q" INTEGER NOT NULL,
    "r" INTEGER NOT NULL,
    "terrain" "TerrainType" NOT NULL,
    "passable" BOOLEAN NOT NULL,
    "movementCost" INTEGER NOT NULL,
    "boardId" INTEGER NOT NULL,

    CONSTRAINT "Tile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "unitType" "UnitName" NOT NULL,
    "name" TEXT NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "meleeAttack" INTEGER NOT NULL,
    "rangedAttack" INTEGER NOT NULL,
    "attackRange" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "uniqueId" INTEGER NOT NULL,
    "posQ" INTEGER,
    "posR" INTEGER,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_gameId_key" ON "Board"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Tile_boardId_q_r_key" ON "Tile"("boardId", "q", "r");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_uniqueId_key" ON "Unit"("uniqueId");

-- CreateIndex
CREATE INDEX "Unit_playerId_idx" ON "Unit"("playerId");

-- CreateIndex
CREATE INDEX "Unit_gameId_idx" ON "Unit"("gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_enemyId_fkey" FOREIGN KEY ("enemyId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tile" ADD CONSTRAINT "Tile_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
