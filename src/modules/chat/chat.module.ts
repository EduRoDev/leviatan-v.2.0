import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { OpenAiModule } from 'src/utils/open-ai/open-ai.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatHistory } from 'src/entities/chat-history.entities';

@Module({
  imports: [
    OpenAiModule,
    TypeOrmModule.forFeature([
      ChatHistory
    ])
  ],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
