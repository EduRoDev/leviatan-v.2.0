import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SubjectModule } from './modules/subject/subject.module';
import { DocumentModule } from './modules/document/document.module';
import { OpenAiModule } from './utils/open-ai/open-ai.module';
import { SummaryModule } from './modules/summary/summary.module';
import { FlashcardModule } from './modules/flashcard/flashcard.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { ChatModule } from './modules/chat/chat.module';
import { StudyPlanModule } from './modules/study-plan/study-plan.module';
import { StatisticsModule } from './modules/statistics/statistics.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: DatabaseService,
    }),
    AuthModule,
    UserModule,
    SubjectModule,
    DocumentModule,
    OpenAiModule,
    SummaryModule,
    FlashcardModule,
    QuizModule,
    ChatModule,
    StudyPlanModule,
    StatisticsModule,


  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
