import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { DocumentService } from 'src/modules/document/document.service';


@Injectable()
export class OpenAiService {
    private openai: OpenAI;

    constructor(
        private readonly configService: ConfigService,
        private readonly documentService: DocumentService
    ) {}

    onModuleInit(){
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('AMAZON_LITE'),
            baseURL: 'https://openrouter.ai/api/v1'
        })
    }

    async resumeDocument(documentId: number): Promise<string> {
        const document = await this.documentService.getDocumentById(documentId);
        if (!document) {
            throw new NotFoundException('Document not found');
        }

        const text = document.content;
        const maxLength = 10000;
        const truncatedText = text.length > maxLength 
            ? text.substring(0, maxLength) + "..." 
            : text;

        const prompt = `Analiza el siguiente texto y genera un resumen completo y conciso.

        FORMATO DE RESPUESTA REQUERIDO (JSON):
        {"summary": "tu resumen aquí"}

        TEXTO A RESUMIR:
        ${truncatedText}

        Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.`

        const systemMessage = `Eres un experto en resumir documentos académicos. 
        Tu respuesta DEBE ser ÚNICAMENTE un objeto JSON válido con el formato: {"summary": "texto del resumen"}
        NO incluyas explicaciones, markdown, ni texto adicional. SOLO el JSON.`

        const response = await this.openai.chat.completions.create({
            model: 'amazon/nova-2-lite-v1:free',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
            ],
        })

        const content = response.choices[0].message?.content

        if (!content){
            throw new InternalServerErrorException('No response from OpenAI');
        }
        return this.parseJsonResumeResponse(content);
    }

    async flashCardDocument(documentId: number): Promise<{subject:string,definition:string}[]> {
        const document = await this.documentService.getDocumentById(documentId);
        if (!document) {
            throw new NotFoundException('Document not found');
        }

        const text = document.content;
        const maxLength = 10000;
        const truncatedText = text.length > maxLength 
            ? text.substring(0, maxLength) + "..." 
            : text;

        const prompt = `Crea EXACTAMENTE 5 flashcards de estudio basadas en el texto.
        Devuelve SOLO un JSON con esta estructura:
        {
            "flashcards": [
                {"subject": "tema 1", "definition": "definición 1"},
                {"subject": "tema 2", "definition": "definición 2"}
            ]
        }
        
        TEXTO:
        ${truncatedText}
        
        IMPORTANTE: Devuelve SOLO el JSON válido, sin texto adicional.`

        const systemMessage = "Eres un experto en crear flashcards educativas. Devuelve solo JSON válido."
    
        const response = await this.openai.chat.completions.create({
            model: 'amazon/nova-2-lite-v1:free',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
            ],
        })

        const content = response.choices[0].message?.content

        if (!content){
            throw new InternalServerErrorException('No response from OpenAI');
        }
        return this.parseFlashCardsResponse(content);
    }

    async quizDocument(documentId: number): Promise<{
        title: string,
        questions: {
            question_text: string,
            options: string[],
            correct_option: string
        }[]
    }>{
        const document = await this.documentService.getDocumentById(documentId);
        if (!document) {
            throw new NotFoundException('Document not found');
        }
        const text = document.content;
        const maxLength = 10000;
        const truncatedText = text.length > maxLength 
            ? text.substring(0, maxLength) + "..." 
            : text;
        
        const prompt = `Crea un quiz con MÍNIMO 5 preguntas basadas en el texto.
        Devuelve SOLO un JSON con esta estructura:
        {
            "quiz": {
                "title": "título del quiz",
                "questions": [
                    {
                        "question_text": "pregunta 1",
                        "options": ["A", "B", "C", "D"],
                        "correct_option": "Opción correcta"
                    }
                ]
            }
        }
        
        TEXTO:
        ${truncatedText}
        
        IMPORTANTE: Devuelve SOLO el JSON válido, sin texto adicional.
        `

        const systemMessage = "Eres un experto en crear quizzes educativos. Devuelve solo JSON válido."

        const response = await this.openai.chat.completions.create({
            model: 'amazon/nova-2-lite-v1:free',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
            ],
        })

        const content = response.choices[0].message?.content

        if (!content){
            throw new InternalServerErrorException('No response from OpenAI');
        }   

        return this.parseQuizResponse(content);

    }


    private parseJsonResumeResponse(content: string): string {
        const cleanedContent = this.cleanMarkdown(content);
        try {
            const parsed = JSON.parse(cleanedContent);
            return parsed.summary;
        } catch {
            const jsonMatch = cleanedContent.match(/\{[\s\S]*"summary"[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.summary;
            }
            throw new InternalServerErrorException('Error al parsear la respuesta del modelo');
        }
    }

    private parseFlashCardsResponse(content: string): {subject:string,definition:string}[] {
        const cleanedContent = this.cleanMarkdown(content);
        try {
            const parsed = JSON.parse(cleanedContent);
            return parsed.flashcards;
        } catch (error) {
            const jsonMatch = cleanedContent.match(/\{[\s\S]*"flashcards"[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.flashcards;
            }
            throw new InternalServerErrorException('Error al parsear la respuesta del modelo');
        }
    }

    private parseQuizResponse(content: string): {
        title: string,
        questions: {
            question_text: string,
            options: string[],
            correct_option: string
        }[]
    } {
        const cleanedContent = this.cleanMarkdown(content);
        try {
            const parsed = JSON.parse(cleanedContent);
            return parsed.quiz;
        } catch (error) {
            const jsonMatch = cleanedContent.match(/\{[\s\S]*"quiz"[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.quiz;
            }
            throw new InternalServerErrorException('Error al parsear la respuesta del modelo');
        }
    }

    private cleanMarkdown(content: string): string {
        return content
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
    }
}
