import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common'; // dekoratory nest
import { ApiOperation, ApiResponse } from '@nestjs/swagger'; // swagger docs
import { PlayerService } from './player.service'; // logika graczy
import { CreatePlayerDto } from './dto/create-player.dto'; // dto tworzenia
import { PlayerRepositoryAdapter } from 'src/infrastructure/PlayerRepositoryAdapter'; // adapter bazy
import { UnitsService } from 'src/units/units.service'; // serwis jednostek

@Controller('players')
export class PlayerController {
  private readonly playerService: PlayerService;

  constructor(
    playerService: PlayerService, // logika graczy
    playerRepository: PlayerRepositoryAdapter, // aby wymusic DI adaptera
    private readonly unitsService: UnitsService, // serwis jednostek (uzywany posrednio)
  ) {
    this.playerService = playerService; // przypisz instancje
  }

  // @Post('create')
  // @ApiOperation({ summary: 'Create a new player' })
  // @ApiResponse({ status: 201, description: 'The player has been successfully created.' })
  // createPlayer(@Body() createPlayerDto: CreatePlayerDto)  {
  //     return this.playerService.createPlayer(createPlayerDto.name, createPlayerDto.color);
  // }
  @Post('create')
  @ApiOperation({ summary: 'create a new player' })
  createPlayerDb(@Body() createPlayerDto: CreatePlayerDto) {
    return this.playerService.create(
      createPlayerDto.name,
      createPlayerDto.color,
    ); // tworzy gracza w bazie
  }

  @Get()
  @ApiOperation({ summary: 'Get all players' })
  @ApiResponse({ status: 200, description: 'List of all players.' })
  getAllPlayers() {
    return this.playerService.findAll(); // lista wszystkich graczy
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player by ID' })
  @ApiResponse({
    status: 200,
    description: 'The player with the specified ID.',
  })
  getPlayerById(@Param('id', ParseIntPipe) id: number) {
    return this.playerService.findById(id); // pobierz gracza po id
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update player details' })
  @ApiResponse({
    status: 200,
    description: 'The player has been successfully updated.',
  })
  updatePlayer(
    @Param('id') id: number,
    @Body() updatePlayerDto: CreatePlayerDto,
  ) {
    return this.playerService.updatePlayer(
      id,
      updatePlayerDto.name,
      updatePlayerDto.color,
    ); // aktualizuj dane gracza
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a player by ID' })
  @ApiResponse({
    status: 200,
    description: 'The player has been successfully deleted.',
  })
  deletePlayer(@Param('id') id: number) {
    return this.playerService.deletePlayer(id); // usun gracza
  }

  @Delete(':playerId/units')
  @ApiOperation({ summary: 'Reset all units for a player (in-memory army)' })
  @ApiResponse({ status: 200, description: 'Units cleared for the player.' })
  clearUnitsForPlayer(@Param('playerId', ParseIntPipe) playerId: number) {
    this.playerService.resetUnits(playerId); // czysci jednostki in-memory
    return { success: true }; // potwierdzenie
  }

  @Post(':playerId/units/:unitId')
  @ApiOperation({ summary: 'Add a unit to a player' })
  @ApiResponse({
    status: 201,
    description: 'The unit has been successfully added to the player.',
  })
  async addUnitToPlayer(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Param('unitId') unitId: string,
  ) {
    const player = await this.playerService.addUnitToPlayer(playerId, unitId); // dodaj jednostke po id definicji
    if (player) {
      return player;
    } else {
      throw new Error('Player not found');
    }
  }

  @Put(':playerId/units/:unitUniqueId')
  @ApiOperation({ summary: 'Delete unit of player' })
  @ApiResponse({
    status: 200,
    description: 'The unit has been successfully deleted from the player.',
  })
  deleteUnitFromPlayer(
    @Param('playerId', ParseIntPipe) playerId: number,
    @Param('unitUniqueId', ParseIntPipe) unitUniqueId: number,
  ) {
    const player = this.playerService.deleteUnitFromPlayer(
      playerId,
      unitUniqueId,
    ); // usun konkretna jednostke
    if (player) {
      return player;
    } else {
      throw new Error('Player or Unit not found');
    }
  }

  @Get(':playerId/budget')
  @ApiOperation({ summary: 'Get player budget by ID' })
  @ApiResponse({
    status: 200,
    description: 'The budget of the player with the specified ID.',
  })
  getPlayerBudget(@Param('playerId', ParseIntPipe) playerId: number) {
    const budget = this.playerService.getPlayerBudget(playerId); // oblicz budzet gracza
    if (budget !== undefined) {
      return { budget };
    } else {
      throw new Error('Player not found');
    }
  }
}
