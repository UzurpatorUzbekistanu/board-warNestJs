import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { PlayerService } from 'src/player/player.service';
import { BoardService } from 'src/board/board.service';
import { UnitsService } from 'src/units/units.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('GameController', () => {
  let controller: GameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [
        GameService,
        { provide: PlayerService, useValue: {} },
        { provide: BoardService, useValue: {} },
        { provide: UnitsService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<GameController>(GameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
