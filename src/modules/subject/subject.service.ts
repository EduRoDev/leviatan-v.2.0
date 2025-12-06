import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from 'src/entities/subject.entities';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateSubjectDTO } from './dto/createSubject.dto';
import { UpdateSubjectDTO } from './dto/updateSubject.dto';

@Injectable()
export class SubjectService {

    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepo: Repository<Subject>,
        private readonly userService: UserService
    ) { }


    async createSubject(createSubjectDTO: CreateSubjectDTO, email: string) {
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newSubject = this.subjectRepo.create({
            ...createSubjectDTO,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        })

        return this.subjectRepo.save(newSubject);
    }

    async updateSubject(id: number, updateSubjectDTO: UpdateSubjectDTO) {
        const subject = await this.subjectRepo.findOneBy({ id });
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        const updatedSubject = Object.assign(subject, updateSubjectDTO);
        return this.subjectRepo.save(updatedSubject);
    }

    async getSubjectsByUser(email: string ){
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const subjects = await this.subjectRepo.find({
            where: {
                user: { id: user.id }
            }
        });
        return subjects;
    }

    async getDocumentsBySubject(id: number) {
        const subject = await this.subjectRepo.findOne({
            where: { id },
            relations: ['documents']
        });
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }
        return subject.documents;
    }

    async deleteSubject(id: number) {
        const subject = await this.subjectRepo.findOneBy({ id });
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }
        const deletedSubject = await this.subjectRepo.delete({ id });
        
        return {
            message: 'Subject deleted successfully',
            deletedSubject
        }
    }
}
