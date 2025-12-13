import { Module } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { FlashcardController } from './flashcard.controller';
import { OpenAiModule } from 'src/utils/open-ai/open-ai.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flashcard } from 'src/entities/flashcard.entities';

@Module({
  imports: [
    OpenAiModule,
    TypeOrmModule.forFeature([Flashcard])
  ],
  providers: [FlashcardService],
  controllers: [FlashcardController]
})
export class FlashcardModule {}
