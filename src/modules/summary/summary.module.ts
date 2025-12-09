import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { OpenAiModule } from 'src/utils/open-ai/open-ai.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Summary } from 'src/entities/summary.entities';

@Module({   
    imports: [
        OpenAiModule,
        TypeOrmModule.forFeature([Summary])
    ],    
    providers: [SummaryService],
    controllers: [SummaryController]
})
export class SummaryModule {}
