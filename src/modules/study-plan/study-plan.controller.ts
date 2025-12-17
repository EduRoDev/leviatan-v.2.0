import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { StudyPlanService } from './study-plan.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('study-plan')
export class StudyPlanController {
    constructor(
        private readonly studyPlanService: StudyPlanService,
    ){}

    @Post('create')
    @UseGuards(AuthGuard)
    async createStudyPlan(@Query('document') documentId: number,@Query('user') userId: number, @Query('level') level_plan: string) {
        return this.studyPlanService.createStudyPlan(documentId, userId, level_plan);
    }

    @Get('find')
    @UseGuards(AuthGuard)
    async getStudyPlans(@Query('user') userId: number, @Query('document') documentId: number) {
        return this.studyPlanService.getStudyPlans(userId, documentId);
    }
}
