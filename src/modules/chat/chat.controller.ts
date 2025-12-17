import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('chat')
export class ChatController {

    constructor(
        private readonly chatService: ChatService
    ){}

    @Post('chat')
    @UseGuards(AuthGuard)
    create(@Query('document')document: number, @Query('user')user: number, @Body('message') message:string){
        return this.chatService.chatWithDocument(document, user, message);
    }

    @Get('history')
    @UseGuards(AuthGuard)
    getChat(@Query('user') userId: number, @Query('document') documentId: number){
        return this.chatService.findChatHistory(userId, documentId);
    }
}
