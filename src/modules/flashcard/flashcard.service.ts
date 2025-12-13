import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flashcard } from 'src/entities/flashcard.entities';
import { OpenAiService } from 'src/utils/open-ai/open-ai.service';
import { Repository } from 'typeorm';

@Injectable()
export class FlashcardService {
    constructor(
        private readonly openAIService: OpenAiService,
        
        @InjectRepository(Flashcard)
        private readonly flashCardRepo: Repository<Flashcard>
    ){}

    async create(documentId: number){
        const flashcardsData = await this.openAIService.flashCardDocument(documentId);
        if (!flashcardsData || flashcardsData.length === 0) {
            throw new BadRequestException('Could not create flashcards');
        }

        const flashcards = flashcardsData.map(item => ({
            question: item.subject,
            answer: item.definition,
            document: { id: documentId }
        }));

        const saved = await this.flashCardRepo.save(flashcards)
        
        return {
            "message": "Flashcards created successfully",
            "data": saved
        }
    }

    async findByDocumentId(id: number){
        return await this.flashCardRepo.find({
            where: {
                document: { id: id}
            }
        })
    }
}
