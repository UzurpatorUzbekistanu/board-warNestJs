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
import { countMovement } from 'src/board/domain/hex.utils';

@Injectable()
export class GameService {

    private games: Game[] = [];
    private idCounter = 1; 

    constructor(
        private readonly playerService: PlayerService, 
        private readonly boardService: BoardService,
        private readonly unitService: UnitsService) {}

async createSoloGame(dto: CreateSoloGameDto): Promise<Game> {
  const player = await this.playerService.findById(dto.playerId);
  if (!player) throw new Error("Player doesn't exist");

  const colorEnemy = player.color === 'red' ? 'blue' : 'red';
  let enemy = await this.playerService.findById(1); // lub inny stały ID
  if (!enemy) enemy = await this.playerService.create('Enemy', colorEnemy);
  enemy.turn = false;

  // tutaj TODO: wczytać/persistować armię w DB; tymczasowo trzymaj w pamięci
  const playerArmy: Unit[] = []; // trzeba zasilić z DB lub wygenerować
  const enemyArmy = playerArmy.map(u => this.unitService.createUnit(u.id as any, enemy));

  const board = this.boardService.getDefaultBoard();
  const game = this.createGame(player as any, playerArmy, enemy as any, enemyArmy, board);
  game.phase = 'deployment';
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
  phase: 'created',
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
  let isOccupied: boolean = this.isOccupied(game.playerArmy, coords)
  isOccupied = this.isOccupied(game.enemyArmy, coords)
  if(isOccupied){
      unit.position = coords;
  }else{
    return undefined
  }

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


finishDeployment(gameId: number): Game | undefined {
  const game: Game = this.findById(gameId);

  const isGameInDeployment: boolean = game.phase === "deployment" ? true: false;

  if (!isGameInDeployment) return undefined;

  const isPlayerArmyDeployed: boolean = game.playerArmy.filter(unit => unit.position == null).length  > 0 ? true : false;
  const isEnemyArmyDeployed: boolean = game.enemyArmy.filter(unit => unit.position == null).length  > 0 ? true : false;
  if(!(isPlayerArmyDeployed && isEnemyArmyDeployed)) return undefined;

  game.phase = 'battle';

  return game;
}

async moveUnit(gameId: number, unitUniqueId: number, targetCoords: HexCoords): Promise<HexCoords | undefined>{
   const game: Game = this.findById(gameId);
   const isPassable = game.board.tiles.find(coords => coords.coords == targetCoords)?.passable
   if(!isPassable){
    return undefined
   }
   const player = await this.playerService.findById(unitUniqueId)
   const currentPosition = player?.units.find(unit => unit.uniqueId == unitUniqueId)?.position
   if (!currentPosition) return undefined
   const costMovement = countMovement(currentPosition,targetCoords, game.board)

   return targetCoords

}
}
