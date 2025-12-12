import { Test, TestingModule } from '@nestjs/testing';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PlayerRepositoryAdapter } from 'src/infrastructure/PlayerRepositoryAdapter';
import { UnitsService } from 'src/units/units.service';

describe('PlayerController', () => {
  let controller: PlayerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerController],
      providers: [
        PlayerService,
        { provide: PlayerRepositoryAdapter, useValue: {} },
        { provide: UnitsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PlayerController>(PlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
