import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestError } from 'openai';
import { ChatHistory } from 'src/entities/chat-history.entities';
import { OpenAiService } from 'src/utils/open-ai/open-ai.service';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {

    constructor(
        private readonly OpenAIService: OpenAiService,

        @InjectRepository(ChatHistory)
        private readonly ChatRepo: Repository<ChatHistory>
    ){}



    async chatWithDocument(documentId: number,user: number, message: string): Promise<String> {
        const response = await this.OpenAIService.chatDocument(documentId, message);
        if (!response) {
            throw new BadRequestException('Error processing chat with document');
        }

        const saveChat = this.ChatRepo.create({
            message: message,
            response: response,
            document: ({ id: documentId }),
            user: ({ id: user })
        })

        await this.ChatRepo.save(saveChat);

        return response;
    }

    async findChatHistory(userId: number, documentId: number): Promise<ChatHistory[]> {
        return await this.ChatRepo.find({
            where: {
                user: { id: userId },
                document: { id: documentId }
            },
            order: {
                timestamp: 'ASC'
            }
        });
    }
}
