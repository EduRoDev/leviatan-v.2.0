import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomStudyPlan } from 'src/entities/custom-study-plan.entities';
import { OpenAiModule } from 'src/utils/open-ai/open-ai.module';
import { StudyPlanService } from './study-plan.service';
import { StudyPlanController } from './study-plan.controller';

@Module({
    imports: [
        OpenAiModule,
        TypeOrmModule.forFeature([CustomStudyPlan])
    ],
    providers: [StudyPlanService],
    controllers: [StudyPlanController],
})
export class StudyPlanModule {}
