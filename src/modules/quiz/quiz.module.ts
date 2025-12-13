import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { OpenAiModule } from 'src/utils/open-ai/open-ai.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from 'src/entities/quiz.entities';
import { Question } from 'src/entities/question.entities';
import { Option } from 'src/entities/option.entities';

@Module({
  imports: [
    OpenAiModule,
    TypeOrmModule.forFeature([Quiz,Question,Option])
  ],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [QuizService]
})
export class QuizModule {}
