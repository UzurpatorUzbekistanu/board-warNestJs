import { Unit } from "../domain/unit.types";

export class LightInfantry implements Unit {
    Name = "Light Infantry";
    MaxHP = 100;
    MeleeAttack = 15;
    RangedAttack = 5;
    AttackRange = 2;
    Defense = 5;
    Speed = 2;
    Cost = 30;
}

export class LineInfantry implements Unit {
    Name = "Line Infantry";
    MaxHP = 150;
    MeleeAttack = 25;
    RangedAttack = 10;
    AttackRange = 3;
    Defense = 10;
    Speed = 2;
    Cost = 45;
}   

export class GuardInfantry implements Unit {
    Name = "Guard Infantry";
    MaxHP = 200;
    MeleeAttack = 35;
    RangedAttack = 15;
    AttackRange = 4;
    Defense = 15;
    Speed = 1;
    Cost = 65;
}

export class LightCavalry implements Unit {
    Name = "Light Cavalry";
    MaxHP = 120;
    MeleeAttack = 30;
    RangedAttack = 0;
    AttackRange = 1;
    Defense = 8;
    Speed = 4;
    Cost = 50;
}   

export class DragonCavalry implements Unit {
    Name = "Dragon Cavalry";
    MaxHP = 180;
    MeleeAttack = 30;
    RangedAttack = 10;
    AttackRange = 2;
    Defense = 12;
    Speed = 3;
    Cost = 80;
}

export class HeavyCavalry implements Unit {
    Name = "Heavy Cavalry";
    MaxHP = 250;
    MeleeAttack = 60;
    RangedAttack = 0;
    AttackRange = 1;
    Defense = 20;
    Speed = 2;
    Cost = 120;
}

export class TwelvePounderCannon implements Unit {
    Name = "12-Pounder Cannon";
    MaxHP = 100 ;
    MeleeAttack = 5;
    RangedAttack = 80;
    AttackRange = 8;
    Defense = 5;
    Speed = 1;
    Cost = 150;
}

export class SixPounderCannon implements Unit {
    Name = "6-Pounder Cannon";
    MaxHP = 80 ;
    MeleeAttack = 5;
    RangedAttack = 50;
    AttackRange = 6;
    Defense = 3;
    Speed = 1;
    Cost = 100;
}

export class HowitzerCannon implements Unit {
    Name = "Howitzer Cannon";
    MaxHP = 90 ;
    MeleeAttack = 5;
    RangedAttack = 70;
    AttackRange = 7;
    Defense = 4;
    Speed = 1;
    Cost = 130;
}
