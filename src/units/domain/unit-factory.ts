import { UNIT_TEMPLATES } from '../data/unit-definitions'; // definicje jednostek
import { GameUnit } from './game-unit'; // implementacja jednostki
import { Unit, UnitName } from './unit.types'; // typy jednostek

export class UnitFactory {
  createFromName(id: UnitName): Unit {
    const template = UNIT_TEMPLATES[id]; // znajdz szablon
    if (!template) {
      throw new Error(`Unknown unit type: ${id}`); // brak definicji
    }

    return new GameUnit(
      template.name, // nazwa
      id, // typ
      template.maxHp, // HP
      template.meleeAttack, // atak wrecz
      template.rangedAttack, // atak dystansowy
      template.attackRange, // zasieg
      template.defense, // obrona
      template.speed, // szybkosc
      template.cost, // koszt
    );
  }

  getAllUnitTemplates(): GameUnit[] {
    return Object.values(UNIT_TEMPLATES).map(
      (template) =>
        new GameUnit(
          template.name, // nazwa
          template.id, // typ
          template.maxHp, // HP
          template.meleeAttack, // atak wrecz
          template.rangedAttack, // atak dystansowy
          template.attackRange, // zasieg
          template.defense, // obrona
          template.speed, // szybkosc
          template.cost, // koszt
        ),
    );
  }
}
