import { Injectable } from '@nestjs/common';
import { Player } from './domain/player';
import { Unit, UnitName } from 'src/units/domain/unit.types';
import { UnitsService } from 'src/units/units.service';

@Injectable()
export class PlayerService {

    private players: Player[] = [];
    private idCounter = 1;

    constructor(private readonly unitService: UnitsService) {}

    createPlayer(name: string, color: string): Player {
        const newPlayer: Player = {
            id: this.idCounter++,
            name,
            color,
            units: [],
            budget: 1000
        };
        this.players.push(newPlayer);
        return newPlayer;
    }

    findAll(): Player[] {
        return this.players;
    }

    findById(id: Player['id']): Player | undefined {
        return this.players.find(player => player.id === id);
    }

    deletePlayer(id: Player['id']): boolean {
        const index = this.players.findIndex(player => player.id === id);
        if (index !== -1) {
            this.players.splice(index, 1);
            return true;
        }
        return false;
    }

    updatePlayer(id: Player['id'], name: string, color: string): Player | undefined {
        const player = this.findById(id);
        if (player) {
            player.name = name;
            player.color = color;
            return player;
        }
        return undefined;
    }

    addUnitToPlayer(playerId: Player['id'], unitIdStr: string): Player | undefined {
    const player = this.findById(playerId);
    const unitId: UnitName = unitIdStr as UnitName;

    if (!player) {
        return undefined;
    }

    const newUnit = this.unitService.createUnit(unitId, player);
    player.units.push(newUnit);

    return player;
    }

    getPlayerBudget(playerId: Player['id']): number | undefined {
        const player = this.findById(playerId);
        return player ? player.budget : undefined;
    }

}
