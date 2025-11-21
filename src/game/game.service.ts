import { Injectable } from '@nestjs/common';
import { BoardService } from 'src/board/board.service';
import { PlayerService } from 'src/player/player.service';
import { Game } from './domain/game';
import { CreateSoloGameDto } from './dto/create-solo-game.dto';
import { Unit } from 'src/units/domain/unit.types';
import { UnitsService } from 'src/units/units.service';
import { Player } from 'src/player/domain/player';
import { Board } from 'src/board/domain/board';
import { HexCoords } from 'src/board/domain/hex.types';

@Injectable()
export class GameService {

    private games: Game[] = [];
    private idCounter = 1; 

    constructor(
        private readonly playerService: PlayerService, 
        private readonly boardService: BoardService,
        private readonly unitService: UnitsService) {}

    createSoloGame(dto: CreateSoloGameDto): Game {
        const player = this.playerService.findById(dto.playerId);
        if(!player){
            throw Error("player doesn't exists")
        }
        const playerArmy = player.units;

        const enemyArmy: Unit[] = [];
        const colorEnemy: string = player.color === "red" ? "blue" : "red"
        const enemyPlayer: Player = this.playerService.createPlayer("Enemy", colorEnemy)

        playerArmy.forEach((unit) => {
        enemyArmy.push(this.unitService.createUnit(unit.id, enemyPlayer));
        });

        const board = this.boardService.getDefaultBoard();

        const game = this.createGame(player, playerArmy, enemyPlayer, enemyArmy, board);
        this.games.push(game);
        return game;
    }

private createGame(
  player: Player,
  playerArmy: Unit[],
  enemy: Player,
  enemyArmy: Unit[],
  board: Board,
): Game {

    const game: Game = {
  id: this.idCounter++,
  player,
  playerArmy,
  enemy: enemy,
  enemyArmy,
  board,
  status: 'in-progress',
  createdAt: new Date(),
};

  return game
}

setUnitPosition(
  gameId: number,
  unitUniqueId: number,
  coords: HexCoords,
): Game | undefined {

  const game: Game = this.findById(gameId);
  const tile = game.board.tiles.find(t => t.coords.q === coords.q && t.coords.r === coords.r)
  let unit = game.playerArmy.find(u => u.uniqueId === unitUniqueId);
  if (!unit) {
    unit = game.enemyArmy.find(u => u.uniqueId === unitUniqueId);
  }
  if (!unit) {
    throw new Error('Unit not found');
  }
  unit.position = coords;

  return game;

}

findById(gameId: number): Game {
  const game: Game[] = this.games.filter(game => game.id === gameId);
  return game[0]
}

 isOccupied(units: Unit[], coords: HexCoords): boolean {
  return units.some(u =>
    u.position?.q != null &&
    u.position?.r != null &&
    u.position.q === coords.q &&
    u.position.r === coords.r
  );
}
}
