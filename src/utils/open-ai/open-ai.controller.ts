import { Controller, Get, Query } from '@nestjs/common';
import { OpenAiService } from './open-ai.service';

@Controller('open-ai')
export class OpenAiController {
    constructor(
        private readonly openAIService: OpenAiService
    ) {}

    @Get('test')
    async resume(@Query('id') id: number) {
        return this.openAIService.quizDocument(id);
    }
}
