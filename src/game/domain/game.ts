import { Board } from 'src/board/domain/board'; // plansza gry
import { Player } from 'src/player/domain/player'; // gracze
import { Unit } from 'src/units/domain/unit.types'; // jednostki

export interface Game {
  id: number; // id gry
  player: Player; // gracz glowny
  playerArmy: Unit[]; // armia gracza
  enemy: Player; // przeciwnik
  enemyArmy: Unit[]; // armia przeciwnika
  board: Board; // plansza
  phase: 'created' | 'deployment' | 'battle' | 'finished'; // etap gry
  createdAt: Date; // data utworzenia
}
