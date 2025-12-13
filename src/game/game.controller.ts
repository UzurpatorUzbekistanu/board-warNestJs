import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'; // nest dekoratory
import { ApiOperation } from '@nestjs/swagger'; // swagger docs
import { GameService } from './game.service'; // logika gry
import { CreateSoloGameDto } from './dto/create-solo-game.dto'; // dto startu gry
import { SetUnitPosition } from './dto/SetUnitPosition.dto'; // dto ustawienia pozycji
import { HexCoords } from 'src/board/domain/hex.types'; // koordy heksowe
import { Game } from './domain/game'; // typ gry
import { ApplyActionDto } from './dto/apply-action.dto'; // dto akcji stanu

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {} // DI serwisu gry

  @Post('solo')
  @ApiOperation({ summary: 'generate standard solo game' })
  createSoloGame(@Body() dto: CreateSoloGameDto) {
    const game = this.gameService.createSoloGame(dto); // tworzy gre w pamieci
    return game;
  }

  @Patch(':gameId/units/:unitUniqueId/position')
  @ApiOperation({ summary: 'setting unit on the board' })
  setUnitPosition(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('unitUniqueId', ParseIntPipe) unitUniqueId: number,
    @Body() setUnitPositionDto: SetUnitPosition,
  ): Game | undefined {
    const coords: HexCoords = {
      q: setUnitPositionDto.q,
      r: setUnitPositionDto.r,
    };
    return this.gameService.setUnitPosition(gameId, unitUniqueId, coords); // ustawia jednostke
  }

  @Post('state/solo')
  @ApiOperation({ summary: 'create solo game state and persist snapshot' })
  async createStatefulSoloGame(@Body() dto: CreateSoloGameDto) {
    return this.gameService.createStatefulSoloGame(dto); // tworzy gre i zapisuje snapshoty
  }

  @Get(':gameId/state')
  @ApiOperation({ summary: 'load persisted game state snapshot' })
  async getGameState(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.gameService.getGameState(gameId); // pobierz zapisany stan gry
  }

  @Get(':gameId/trajectory')
  @ApiOperation({
    summary: 'export full game trajectory (actions + snapshots)',
  })
  async getTrajectory(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.gameService.getTrajectory(gameId); // zwroc akcje + snapshoty
  }

  @Post(':gameId/actions')
  @ApiOperation({ summary: 'apply action and update game state' })
  async applyAction(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() actionDto: ApplyActionDto,
  ) {
    return this.gameService.applyAction(gameId, actionDto); // wykonaj akcje i zapisz stan
  }
}
