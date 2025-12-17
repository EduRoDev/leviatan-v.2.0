import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { SubmitQuizDto } from './dto/submit.dto';


@Controller('statistics')
export class StatisticsController {
    constructor(
        private readonly statisticsService: StatisticsService
    ) {}

    @Post('quiz/:quizId/submit')
    async submitQuiz(
        @Param('quizId') quizId: number,
        @Query('user') userId: number,
        @Body() submitQuizDto: SubmitQuizDto
    ) {
        const attempt = await this.statisticsService.recordQuizAttempt(
            userId,
            quizId,
            submitQuizDto.answers,
            submitQuizDto.time_taken
        );

        return {
            message: 'Quiz submitted successfully',
            attempt: {
                id: attempt.id,
                score: attempt.score,
                correct_answers: attempt.correct_answers,
                total_questions: attempt.total_questions,
                time_taken: attempt.time_taken,
                completed_at: attempt.completed_at
            }
        };
    }

    @Get('user/statistics')
    async getUserStatistics(@Query('user') userId: number) {
        return await this.statisticsService.getUserStatistics(userId);
    }

    @Get('user/progress-by-subject')
    async getUserProgressBySubject(@Query('user') userId: number) {
        return await this.statisticsService.getUserProgressBySubject(userId);
    }

    @Get('quiz/:quizId/statistics')
    async getQuizStatistics(@Param('quizId') quizId: number) {
        return await this.statisticsService.getQuizStatistics(quizId);
    }   
}
