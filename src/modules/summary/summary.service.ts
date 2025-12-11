import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Summary } from 'src/entities/summary.entities';
import { OpenAiService } from 'src/utils/open-ai/open-ai.service';
import { Repository } from 'typeorm';

@Injectable()
export class SummaryService {
    constructor(
        @InjectRepository(Summary)
        private readonly summaryRepo: Repository<Summary>,
        private readonly openAIService: OpenAiService
    ) { }

    async create(documentId: number): Promise<Summary> {
        const response = await this.openAIService.resumeDocument(documentId);
        const summary = this.summaryRepo.create({
            content: response,
            document: {
                id: documentId
            }
        });
        const savedSummary = this.summaryRepo.save(summary);
        return {
            ...savedSummary,
            message: 'Summary created successfully'
        }
    }

    async findById(id: number) {
        return this .summaryRepo.findOneBy({ id })
    }

    async findByDocumentId(documentId: number): Promise<Summary[]> {
        return this.summaryRepo.find({
            where: {
                document: {
                    id: documentId
                }
            }
        });
    }

}
