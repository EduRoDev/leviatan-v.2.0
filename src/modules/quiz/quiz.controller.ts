import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('quiz')
export class QuizController {
    constructor(
        private readonly quizService: QuizService
    ){}

    @Post('create')
    @UseGuards(AuthGuard)
    create(@Query('document') document: number){
        return this.quizService.createQuiz(document);
    }

    @Get('find')
    @UseGuards(AuthGuard)
    find(@Query('document') document: number){
        return this.quizService.getQuizByDocument(document);
    }
}
