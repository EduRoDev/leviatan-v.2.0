import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FlashcardService } from './flashcard.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('flashcard')
export class FlashcardController {
    constructor(
        private readonly flashcardService: FlashcardService
    ){}

    @Post('create')
    @UseGuards(AuthGuard)
    async create(@Query('document') documentId: number){
        return await this.flashcardService.create(documentId);
    }


    @Get('find')
    @UseGuards(AuthGuard)
    async findById(@Query('id') id: number){
        return await this.flashcardService.findByDocumentId(id);
    }
}
