import { Injectable } from '@nestjs/common';
import { DEFAULT_BOARD } from './data/board-definition';
import GameBoard from './domain/board';

@Injectable()
export class BoardService {

    private readonly board: GameBoard = DEFAULT_BOARD;

    getDefaultBoard(): GameBoard {
        return this.board;
    }


}
