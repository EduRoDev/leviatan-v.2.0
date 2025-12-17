import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomStudyPlan } from 'src/entities/custom-study-plan.entities';
import { OpenAiService } from 'src/utils/open-ai/open-ai.service';
import { Repository } from 'typeorm';

@Injectable()
export class StudyPlanService {
    
    private readonly  validLevels = ['basico', 'intermedio', 'avanzado'];
    
    constructor(
        @InjectRepository(CustomStudyPlan)
        private readonly studyPlanRepo: Repository<CustomStudyPlan>,
        private readonly openAiService: OpenAiService
    ){}

    async createStudyPlan(documentId: number, userId: number, level_plan: string): Promise<{ message: string }>{
        if (!this.validLevels.includes(level_plan.toLowerCase())) {
            throw new BadRequestException('Invalid level. Valid levels are: basico, intermedio, avanzado');
        }
        
        const response = await this.openAiService.studyPlanDocument(documentId,level_plan);
        if (!response) {
            throw new BadRequestException('Failed to generate study plan');
        }

        const newStudyPlan = this.studyPlanRepo.create({
            title: `Plan de estudio - ${level_plan}`,
            level: level_plan,
            content: response,
            document: { id: documentId },
            user: { id: userId }
        })

        await this.studyPlanRepo.save(newStudyPlan);

        return {
            message: 'Study plan created successfully',
        };
    }

    async getStudyPlans(userId: number, documentId: number): Promise<CustomStudyPlan[]> {
        return this.studyPlanRepo.find({
            where: {
                user: { id: userId },
                document: { id: documentId }
            }
        });
    }
}
