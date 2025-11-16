// src/board/data/board-definition.ts

import {HexTile, TerrainType } from '../domain/hex.types';
import GameBoard from '../domain/board';

const BOARD_WIDTH = 5;
const BOARD_HEIGHT = 5;

function createTile(q: number, r: number): HexTile {
  // wartości domyślne
  let terrain = TerrainType.Plain;
  let passable = true;
  let movementCost = 1;

  // woda na brzegach mapy
  if (q === 0 || q === BOARD_WIDTH - 1 || r === 0 || r === BOARD_HEIGHT - 1) {
    terrain = TerrainType.Water;
    passable = false;
    movementCost = 99;
  }

  // środek mapy jako miasto
  const centerQ = Math.floor(BOARD_WIDTH / 2);
  const centerR = Math.floor(BOARD_HEIGHT / 2);

  if (q === centerQ && r === centerR) {
    terrain = TerrainType.City;
    passable = true;
    movementCost = 1;
  }

  // lasy po bokach miasta
  if (
    (q === centerQ - 1 && r === centerR) ||
    (q === centerQ + 1 && r === centerR)
  ) {
    terrain = TerrainType.Forest;
    passable = true;
    movementCost = 2;
  }

  return {
    coords: { q, r },
    terrain,
    passable,
    movementCost,
  };
}

const tiles: HexTile[] = [];

for (let q = 0; q < BOARD_WIDTH; q++) {
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    tiles.push(createTile(q, r));
  }
}

export const DEFAULT_BOARD: GameBoard = {
  tiles,
};
