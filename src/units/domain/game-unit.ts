import { SquareCoords } from 'src/board/domain/square.types'; // koordy planszy
import { Unit, UnitName } from './unit.types'; // kontrakt jednostki

export class GameUnit implements Unit {
  public static globalIdCounter = 1; // prosty licznik unikalnych id
  constructor(
    public name: string, // nazwa jednostki
    public id: UnitName, // typ jednostki
    public maxHp: number, // HP
    public meleeAttack: number, // atak wrecz
    public rangedAttack: number, // atak dystansowy
    public attackRange: number, // zasieg strzalu
    public defense: number, // obrona
    public speed: number, // szybkosc ruchu
    public cost: number, // koszt rekrutacji
    public uniqueId: number = getUniqueIdForNewInstance(), // unikalny egzemplarz
    public position: SquareCoords | null = null, // polozenie na mapie
    public playerId: number = 0, // wlasciciel
  ) {}
}

function getUniqueIdForNewInstance(): number {
  return GameUnit.globalIdCounter++; // inkrementuj licznik globalny
}
