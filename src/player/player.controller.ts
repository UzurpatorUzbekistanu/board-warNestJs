import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Unit } from 'src/units/domain/unit.types';

@Controller('players')
export class PlayerController {

    private readonly playerService: PlayerService;

    constructor(playerService: PlayerService) {
        this.playerService = playerService;
    }

    @Post('create')
    @ApiOperation({ summary: 'Create a new player' })
    @ApiResponse({ status: 201, description: 'The player has been successfully created.' })
    createPlayer(@Body() createPlayerDto: CreatePlayerDto)  {
        this.playerService.createPlayer(createPlayerDto.name, createPlayerDto.color);
    }

    @Get()
    @ApiOperation({ summary: 'Get all players' })
    @ApiResponse({ status: 200, description: 'List of all players.' })
    getAllPlayers() {
        return this.playerService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get player by ID' })
    @ApiResponse({ status: 200, description: 'The player with the specified ID.' })
    getPlayerById(@Param('id') id: number) {
        return this.playerService.findById(id);
    }

    @Put('update/:id')
    @ApiOperation({ summary: 'Update player details' })
    @ApiResponse({ status: 200, description: 'The player has been successfully updated.' })
    updatePlayer(@Param('id') id: number, @Body() updatePlayerDto: CreatePlayerDto) {
        return this.playerService.updatePlayer(id, updatePlayerDto.name, updatePlayerDto.color);
    }

    @Delete('delete/:id')
    @ApiOperation({ summary: 'Delete a player by ID' })
    @ApiResponse({ status: 200, description: 'The player has been successfully deleted.' })
    deletePlayer(@Param('id') id: number) {
        return this.playerService.deletePlayer(id);
    }

    @Post(':playerId/units/:unitId')
    @ApiOperation({ summary: 'Add a unit to a player' })
    @ApiResponse({ status: 201, description: 'The unit has been successfully added to the player.' })
    addUnitToPlayer(
        @Param('playerId', ParseIntPipe) playerId: number, 
        @Param('unitId') unitId: string) {
        
        const player = this.playerService.addUnitToPlayer(playerId, unitId);
        if (player) {
            return player;
        } else {
            throw new Error('Player not found');
        }   
    }

}
