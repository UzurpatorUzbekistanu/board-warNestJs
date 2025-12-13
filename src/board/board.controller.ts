// board.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common'; // nest kontroler i walidacja bledow
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'; // dekoratory swagger
import { IsNumber, IsObject, ValidateNested } from 'class-validator'; // walidacja DTO
import { Type } from 'class-transformer'; // transformacja z requestu
import { BoardService } from './board.service'; // logika planszy
import { HexCoords } from './domain/hex.types'; // typ koordow

class HexCoordsDto implements HexCoords {
  @IsNumber() q!: number; // wspolrzedna q
  @IsNumber() r!: number; // wspolrzedna r
}

class MoveUnitDto {
  @ValidateNested()
  @Type(() => HexCoordsDto)
  @IsObject()
  currentPosition!: HexCoordsDto; // pole startowe jednostki

  @ValidateNested()
  @Type(() => HexCoordsDto)
  @IsObject()
  targetCoords!: HexCoordsDto; // pole docelowe
}

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {} // DI serwisu planszy

  @Get('default')
  @ApiOperation({ summary: 'Get the default game board' })
  @ApiResponse({ status: 200, description: 'The default game board.' })
  getDefaultBoard() {
    return this.boardService.getDefaultBoard(); // zwroc domyslna plansze
  }

  @Post('move')
  @ApiOperation({ summary: 'Calculate movement cost between two tiles' })
  @ApiBody({ type: MoveUnitDto })
  moveUnit(@Body() body: MoveUnitDto) {
    if (!body?.currentPosition || !body?.targetCoords) {
      throw new BadRequestException(
        'currentPosition and targetCoords are required',
      ); // brak danych
    }

    return this.boardService.countDistanceBetweenTwoTilles(
      body.currentPosition,
      body.targetCoords,
    ); // zwroc trase i koszt
  }
}
