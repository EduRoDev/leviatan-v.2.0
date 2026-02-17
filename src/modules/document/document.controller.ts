import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDTO } from './dto/createDocument.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('document')
@UseGuards(AuthGuard)
export class DocumentController {
    constructor(
        private readonly documentService: DocumentService
    ) {}

    @Post('create')
    @UseInterceptors(FileInterceptor('file',{
        fileFilter: (req, file, callback) => {
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ]

            if(allowedTypes.includes(file.mimetype)){
                callback(null, true)
            }
            else{
                callback(new Error('Invalid file type'), false)
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024
        }
    }))
    async createDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body() createDocumentDTO: CreateDocumentDTO,
        @Query('subjectId') subjectId: number
    ){
        return this.documentService.createDocument(
            file,
            createDocumentDTO,
            subjectId
        )
    }

    @Get(':id')
    async getDocumentById(@Param('id', ParseIntPipe) id: number) {
        return this.documentService.getDocumentById(id);
    }

    @Delete(':id')
    
    async deleteDocument(@Param('id', ParseIntPipe) id: number) {
        return this.documentService.deleteDocument(id);
    }

    @Post(':id/retrieve')
    
    async retrieveContext(
        @Param('id', ParseIntPipe) documentId: number,
        @Body('query') query: string,
        @Body('nResults') nResults?: number,
    ) {
        return this.documentService.retrieveContext(documentId, query, nResults);
    }

    @Post('Audio')
    async generateAudio(@Query('id', ParseIntPipe) id: number) {
        return this.documentService.generateAudioByDocument(id);
    }


}
