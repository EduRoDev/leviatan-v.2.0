import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from 'src/entities/quiz-attempt.entities';
import { QuizAnswer } from 'src/entities/quiz-answer.entities';
import { Quiz } from 'src/entities/quiz.entities';
import { Question } from 'src/entities/question.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizAttempt, QuizAnswer, Quiz, Question])
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController]
})
export class StatisticsModule {}
