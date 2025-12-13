import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { UnitsService } from 'src/units/units.service';
import { PlayerRepositoryAdapter } from 'src/infrastructure/PlayerRepositoryAdapter';

describe('PlayerService', () => {
  let service: PlayerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        { provide: UnitsService, useValue: {} },
        { provide: PlayerRepositoryAdapter, useValue: {} },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
