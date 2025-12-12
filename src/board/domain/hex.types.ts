import { Unit } from 'src/units/domain/unit.types'; // definicja jednostki umieszczonej na polu

type axialCoords = {
  q: number; // wspolrzedna q w axial
  r: number; // wspolrzedna r w axial
};

export enum TerrainType {
  Plain = 'plain', // rownina
  Forest = 'forest', // las
  Hill = 'hill', // wzgorze
  Water = 'water', // woda
  City = 'city', // miasto
  Swamp = 'swamp', // bagno
  Road = 'road', // droga
  Bridge = 'bridge', // most
  Ford = 'ford', // brod
}

export type HexCoords = axialCoords; // alias na koordy axial

export interface HexTile {
  coords: HexCoords; // polozenie na planszy
  terrain: TerrainType; // typ terenu
  passable: boolean; // czy mozna przejsc/przejechac
  movementCost: number; // koszt ruchu przez pole
  unit?: Unit; // jednostka zajmujaca pole (opcjonalnie)
}
