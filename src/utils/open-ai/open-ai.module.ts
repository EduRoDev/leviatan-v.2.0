import { Module } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';
//import { HttpModule } from '@nestjs/axios';
import { DocumentModule } from 'src/modules/document/document.module';
import { ConfigModule } from '@nestjs/config';
import { OpenAiController } from './open-ai.controller';

@Module({
  imports: [
    //HttpModule,
    DocumentModule,
    ConfigModule
  ],
  providers: [OpenAiService],
  exports: [OpenAiService],
  controllers: [OpenAiController],
})
export class OpenAiModule {}
