import { Injectable } from '@nestjs/common';
import { SubjectService } from '../subject/subject.service';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { Document } from 'src/entities/document.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDocumentDTO } from './dto/createDocument.dto';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

    
    

}
