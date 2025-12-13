import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { PlayerService } from 'src/player/player.service';
import { BoardService } from 'src/board/board.service';
import { UnitsService } from 'src/units/units.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: PlayerService, useValue: {} },
        { provide: BoardService, useValue: {} },
        { provide: UnitsService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
