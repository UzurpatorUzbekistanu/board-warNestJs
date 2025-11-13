import { Injectable } from '@nestjs/common';
import { Player } from 'src/player/domain/player';
import { Unit } from './domain/unit.types';
import { DragonCavalry, GuardInfantry, HeavyCavalry, LightCavalry, LightInfantry, LineInfantry, SixPounderCannon, TwelvePounderCannon } from './data/unit-definitions';

@Injectable()
export class UnitsService {


    getPlayerUnits(playerId: Player['id']): Unit[] {
        let units: Unit[] = [];
        return units
    }

    createLightInfantry(): Unit {
        const unit: LightInfantry = new LightInfantry();
        return unit;
    }
    
    createLineInfantry(): Unit {
        const unit: LineInfantry = new LineInfantry();
        return unit;
    }
    createGuardInfantry(): Unit {
        const unit: Unit = new GuardInfantry();
        return unit;
    }
    createLightCavalry(): Unit {
        const unit: Unit = new LightCavalry();
        return unit;
    }
    createDragonCavalry(): Unit {
        const unit: Unit = new DragonCavalry();
        return unit;
    }
    createHeavyCavalry(): Unit {
        const unit: Unit = new HeavyCavalry();
        return unit;
    }
    createTwelvePounderCannon(): Unit {
        const unit: Unit = new TwelvePounderCannon();
        return unit;
    }
    createSixPounderCannon(): Unit {
        const unit: Unit = new SixPounderCannon();
        return unit;
    }
    createHowitzerCannon(): Unit {
        const unit: Unit = new SixPounderCannon();
        return unit;
    }
}
