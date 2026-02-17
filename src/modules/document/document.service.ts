import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SubjectService } from '../subject/subject.service';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { Document } from 'src/entities/document.entities';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDocumentDTO } from './dto/createDocument.dto';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs'
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import wav from 'wav';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

@Injectable()
export class DocumentService {

    private readonly PYTHON_SERVICE_URL = process.env.MICROSERVICE_URL;
    private readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'documents')
    private readonly UPLOAD_DIR_AUDIO = path.join(process.cwd(), 'public', 'audio')

    constructor(
        private readonly subjectService: SubjectService,
        private readonly httpService: HttpService,

        @InjectRepository(Document)
        private readonly documentRepo: Repository<Document>

    ) {
        if (!fs.existsSync(this.UPLOAD_DIR)) {
            fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
        }
        if (!fs.existsSync(this.UPLOAD_DIR_AUDIO)) {
            fs.mkdirSync(this.UPLOAD_DIR_AUDIO, { recursive: true });
        }
    }

    private sanitizeFilename(filename: string): string {
        const normalized = filename
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ñ/g, 'n')
            .replace(/Ñ/g, 'N')
            .replace(/[^a-zA-Z0-9.\-_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');

        return normalized;
    }

    async createDocument(
        file: Express.Multer.File,
        createDocumentDTO: CreateDocumentDTO,
        subjectId: number
    ) {

        const subject = await this.subjectService.getDocumentsBySubject(subjectId);
        if (!subject) {
            throw new NotFoundException('Subject not found');
        }

        const sanitizedFilename = this.sanitizeFilename(file.originalname);
        const filename = `${Date.now()}-${sanitizedFilename}`;
        const filepath = path.join(this.UPLOAD_DIR, filename);

        try {
            fs.writeFileSync(filepath, file.buffer)
        } catch (error) {
            throw new InternalServerErrorException('Error saving file')
        }

        const newDocument = this.documentRepo.create({
            title: createDocumentDTO.title,
            content: '',
            file_path: this.buildFilePath(`documents/${filename}`),
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
    private async extractData(filepath: string, documentId: number) {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filepath), path.basename(filepath));
        formData.append('document_id', documentId.toString());

        try {
            const response = await firstValueFrom(
                this.httpService.post(
                    `${this.PYTHON_SERVICE_URL}/document/index`,
                    formData,
                    {
                        headers: formData.getHeaders(),
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

        const relativePath = document.file_path.replace(process.env.BASE_URL || 'http://localhost:3000', '');
        const filePath = path.join(process.cwd(), 'public', relativePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await this.documentRepo.delete(id);

        return { message: 'Document deleted successfully' };
    }

    async saveWaveFile(
        filename,
        pcmData,
        channels = 1,
        rate = 24000,
        sampleWidth = 2,
    ) {
        return new Promise((resolve, reject) => {
            const writer = new wav.FileWriter(filename, {
                channels,
                sampleRate: rate,
                bitDepth: sampleWidth * 8,
            });

            writer.on('finish', resolve);
            writer.on('error', reject);

            writer.write(pcmData);
            writer.end();
        });
    }

    async generateAudioByDocument(id: number) {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_KEY
        });

        const document = await this.getDocumentById(id);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: document.content }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                    },
                },
            },
        });

        const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!data) {
            throw new InternalServerErrorException('No audio data received from API');
        }
        const audioBuffer = Buffer.from(data, 'base64');

        const fileName = `audio-${id}-${Date.now()}.wav`;
        const fullPath = path.join(this.UPLOAD_DIR_AUDIO, fileName);
        await this.saveWaveFile(fullPath, audioBuffer);
        document.audio_url = this.buildFilePath(`audio/${fileName}`);
        await this.documentRepo.save(document);

        return {
            'message': 'Audio generated successfully',
        }
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

    private buildFilePath(relativePath: string): string {
        if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
            return relativePath;
        }

        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        return `${baseUrl}${cleanPath}`;
    }


}
