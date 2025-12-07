import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SubjectService } from '../subject/subject.service';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { Document } from 'src/entities/document.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDocumentDTO } from './dto/createDocument.dto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs'

dotenv.config();    

@Injectable()
export class DocumentService {

    private readonly PYTHON_SERVICE_URL = process.env.MICROSERVICE_URL;
    private readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'documents')

    constructor(
        private readonly subjectService: SubjectService,
        private readonly httpService: HttpService,

        @InjectRepository(Document)
        private readonly documentRepo: Repository<Document>

    ){
        if(!fs.existsSync(this.UPLOAD_DIR)){
            fs.mkdirSync(this.UPLOAD_DIR, { recursive: true } );
        }
    }


    async createDocument(
        file: Express.Multer.File,
        createDocumentDTO: CreateDocumentDTO,
        subjectId: number
    ){

        const subject = await this.subjectService.getDocumentsBySubject(subjectId);
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        const filename = `${Date.now()}-${file.originalname}`;
        const filepath = path.join(this.UPLOAD_DIR, filename);
        
        try {
           fs.writeFileSync(filepath, file.buffer) 
        } catch (error) {
            throw new InternalServerErrorException('Error saving file')
        }

        const newDocument = this.documentRepo.create({
            title: createDocumentDTO.title,
            content: '',
            file_path: `/documents/${filename}`,
            subject: {
                id: subjectId
            }
        })

        const saveDocument = await this.documentRepo.save(newDocument);

        try {
            const extractData = await this.extractData(filepath, saveDocument.id);
            saveDocument.content = extractData.content
            await this.documentRepo.save(saveDocument)

            return {
                ...saveDocument,
                chunks_indexed: extractData.chunks_indexed,
                message: 'Document created and data extracted successfully'
            }

        } catch (error) {
            await this.documentRepo.delete(saveDocument.id);
            fs.unlinkSync(filepath);
            throw new BadRequestException('Error extracting data from document')
        }
        

    }

    private async extractData(filepath: string, documentId: number){
        const formData = new FormData();
        formData.append('file', fs.creatReadStream(filepath));
        formData.append('document_id', documentId.toString());

        try{
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.PYTHON_SERVICE_URL}/document/index`,
                    formData,
                    {
                        headers: {
                            ...formData.getHeaders()
                        },
                    }
                )
            )

            return {
                content: response.data.content,
                chunks_indexed: response.data.chunks_indexed
            }
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Error extracting data from document');
        }
        
    }

    async getDocumentById(id: number) {
        const document = await this.documentRepo.findOneBy({ id });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    async deleteDocument(id: number) {
        const document = await this.documentRepo.findOneBy({ id });
        
        if (!document) {
            throw new NotFoundException('Document not found');
        }

        try {
            await firstValueFrom(
                this.httpService.delete(`${this.PYTHON_SERVICE_URL}/document/${id}/`)
            );
        } catch (error) {
            console.error('Error deleting from ChromaDB:', error.message);
        }

        const filePath = path.join(process.cwd(), 'public', document.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await this.documentRepo.delete(id);

        return { message: 'Document deleted successfully' };
    }

    async retrieveContext(documentId: number, query: string, nResults: number = 5) {
        await this.getDocumentById(documentId);

        try {
            const response = await firstValueFrom(
                this.httpService.post(`${this.PYTHON_SERVICE_URL}/document/retrieve/`, {
                    query,
                    document_id: documentId,
                    n_results: nResults
                })
            );

            return response.data;
        } catch (error) {
            throw new BadRequestException('Error retrieving context');
        }
    }
    
    

}
