import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateSubjectDTO } from './dto/createSubject.dto';
import { SubjectService } from './subject.service';
import { UpdateSubjectDTO } from './dto/updateSubject.dto';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('subject')
export class SubjectController {

    constructor(
        private readonly subjectService: SubjectService
    ){}

    @Post('create')
    @UseGuards(AuthGuard)
    createSubject(
        @Body() createSubjectdto: CreateSubjectDTO, 
        @Query('email') email: string
    ){
        return this.subjectService.createSubject(createSubjectdto, email);
    }

    @Get('by-user')
    @UseGuards(AuthGuard)
    getSubjectsByUser(@Query('email') email: string){
        return this.subjectService.getSubjectsByUser(email);
    }

    @Get('documents')
    @UseGuards(AuthGuard)
    getDocumentsBySubject(@Query('id') id: number){
        return this.subjectService.getDocumentsBySubject(id);
    }

    @Patch('update')
    @UseGuards(AuthGuard)
    updateSubject(
        @Query('id') id: number,
        @Body() updateSubjectDTO: UpdateSubjectDTO
    ){
        return this.subjectService.updateSubject(id, updateSubjectDTO);
    }

    @Delete('delete')
    @UseGuards(AuthGuard)
    deleteSubject(@Query('id') id: number){
        return this.subjectService.deleteSubject(id);
    }
}
