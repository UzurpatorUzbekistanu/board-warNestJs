import { Injectable } from '@nestjs/common';
import { Player } from 'src/player/domain/player';
import { Unit, UnitName } from './domain/unit.types';
import { UnitFactory } from './domain/unit-factory';

@Injectable()
export class UnitsService {

    private customUnits: Unit[] = [];
    private readonly factory = new UnitFactory();

    createUnit(id: UnitName, player: Player): Unit {
        const newUnit = this.factory.createFromName(id);
        player.budget -= newUnit.cost;
        if (player.budget < 0) {
            throw new Error('Insufficient budget to create this unit.');
        }
        this.customUnits.push(newUnit);
        return newUnit;
    }
    createUnitWithoutPlayer(id: UnitName): Unit {
        const newUnit = this.factory.createFromName(id);
        this.customUnits.push(newUnit);
        return newUnit;
    }

    getPlayerUnits(playerId: Player['id']): Unit[] {
        let units: Unit[] = [];
        return units
    }

    getAllAvailableUnits(): Unit[] {
        return this.factory.getAllUnitTemplates();
    }

    getUnitById(id: UnitName): Unit {
        return this.factory.createFromName(id);
    }
}
