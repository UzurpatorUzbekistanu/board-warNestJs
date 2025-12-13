import { Unit } from 'src/units/domain/unit.types'; // definicja jednostek gracza

export class Player {
  id: number; // id gracza
  name: string; // nazwa
  color: string; // kolor gracza
  units: Unit[]; // jednostki przypisane
  budget: number = 1000; // budzet startowy
  turn: boolean = true; // czy teraz ruch gracza

  constructor(id: number, name: string, color: string) {
    this.id = id; // przypisz id
    this.name = name; // przypisz nazwe
    this.color = color; // przypisz kolor
    this.units = []; // init jednostek
  }
}

export class newPlayer {
  name: string; // nazwa
  color: string; // kolor
  units: Unit[]; // jednostki nowego gracza
  budget: number = 1000; // budzet
  turn: boolean = true; // czy zaczyna ture

  constructor(name: string, color: string) {
    this.name = name; // przypisz nazwe
    this.color = color; // przypisz kolor
    this.units = []; // pusty set jednostek
  }
}
