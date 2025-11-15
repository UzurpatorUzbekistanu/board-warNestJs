import { HexTile } from "./hex.types";

export interface Board {
    tiles: HexTile[];
}

export class GameBoard implements Board {
    constructor(public tiles: HexTile[]) {}
}