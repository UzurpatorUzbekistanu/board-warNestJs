import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {

    private readonly boardService: BoardService;

    constructor(boardService: BoardService) {
        this.boardService = boardService;
    }

    @Get('default')
    @ApiOperation({ summary: 'Get the default game board' })
    @ApiResponse({ status: 200, description: 'The default game board.' })
    getDefaultBoard() {
        return this.boardService.getDefaultBoard();
    }

}
