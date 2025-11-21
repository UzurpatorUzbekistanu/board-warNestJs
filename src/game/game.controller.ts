import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { ApiOperation } from 'node_modules/@nestjs/swagger/dist';
import { CreateSoloGameDto } from './dto/create-solo-game.dto';
import { SetUnitPosition } from './dto/SetUnitPosition.dto';
import { HexCoords } from 'src/board/domain/hex.types';
import { Game } from './domain/game';

@Controller('game')
export class GameController {

    constructor(private readonly gameService: GameService){}

    @Post('solo')
    @ApiOperation({summary: 'generate standard solo game'})
    createSoloGame(@Body() dto: CreateSoloGameDto){
        const game = this.gameService.createSoloGame(dto);
        return game;
    }

    @Patch(':gameId/units/:unitUniqueId/position')
    @ApiOperation({summary: 'setting unit on the board'})
    setUnitPosition(@Param('gameId', ParseIntPipe) gameId: number, 
                    @Param('unitUniqueId', ParseIntPipe) unitUniqueId: number,
                    @Body() setUnitPositionDto: SetUnitPosition): Game | undefined{
                        let coords: HexCoords = {
                            q: setUnitPositionDto.q,
                            r: setUnitPositionDto.r
                        }
                        return this.gameService.setUnitPosition(gameId, unitUniqueId, coords)
                    }


}
