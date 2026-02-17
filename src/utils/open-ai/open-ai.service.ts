import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as path from 'path';
import * as fs from 'fs'
import { DocumentService } from 'src/modules/document/document.service';


@Injectable()
export class OpenAiService {
    private openai: OpenAI;
    private readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'documents')

    constructor(
        private readonly configService: ConfigService,
        private readonly documentService: DocumentService
    ) { }

    onModuleInit() {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('AMAZON_LITE'),
            baseURL: 'https://openrouter.ai/api/v1'
        })
    }

    // async generateAudio(documentId: number): Promise<string> {
    //     const document = await this.documentService.getDocumentById(documentId)
    //     const response = await this.openai.audio.speech.create({
    //         model: 'amazon/nova-2-lite-v1:free',
    //         input: document.content,
    //         voice: 'alloy',
    //     })

    //     const buffer = Buffer.from(await response.arrayBuffer());
    //     const filename = `document-${documentId}-${Date.now()}.mp3`;
    //     const filePath = path.join(this.UPLOAD_DIR, filename);
    //     fs.writeFileSync(filePath, buffer);

    //     return "audio created successfully";
    // }

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

        if (!content) {
            throw new InternalServerErrorException('No response from OpenAI');
        }
        return this.parseJsonResumeResponse(content);
    }

    async flashCardDocument(documentId: number): Promise<{ subject: string, definition: string }[]> {
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

        if (!content) {
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
    }> {
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

        if (!content) {
            throw new InternalServerErrorException('No response from OpenAI');
        }

        return this.parseQuizResponse(content);

    }

    async chatDocument(documentId: number, userMessage: string): Promise<string> {
        const document = await this.documentService.getDocumentById(documentId)
        if (!document) {
            throw new NotFoundException('Document not found');
        }

        const text = document.content;
        const maxLength = 10000;
        const truncatedText = text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;

        const systemMessage = `Eres un asistente educativo experto. Responde preguntas sobre el siguiente documento.
            
            DOCUMENTO:
            ${truncatedText}
            
            INSTRUCCIONES:
            - Responde ÚNICAMENTE basándote en la información del documento
            - Si la información no está en el documento, indícalo claramente
            - Sé conciso y claro en tus respuestas
            - Mantén un tono profesional y educativo
            - Las respuestas deben tener un limite de 300 palabras
            - No utilices negrillas ni cursivas
            - No utilices markdown para devolver la respuesta`

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
        ]

        const response = await this.openai.chat.completions.create({
            model: 'amazon/nova-2-lite-v1:free',
            messages: messages
        })

        const content = response.choices[0].message?.content
        if (!content) {
            throw new InternalServerErrorException('No response from OpenAI');
        }
        return content;

    }

    async studyPlanDocument(documentId: number, level_plan: string): Promise<{
        objectives: string[],
        recommended_resources: string[],
        schedule: { [key: string]: string }
    }> {
        const document = await this.documentService.getDocumentById(documentId);
        if (!document) {
            throw new NotFoundException('Document not found');
        }

        const text = document.content;
        const maxLength = 10000;
        const truncatedText = text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;

        const prompt = `
            Basándote en el siguiente contenido del documento, crea un plan de estudio personalizado para un estudiante de nivel ${level_plan}.
            El plan debe incluir objetivos claros, recursos recomendados y un cronograma sugerido.

            DOCUMENTO:
            ${truncatedText}

            FORMATO DE RESPUESTA REQUERIDO (JSON):
            {
                "study_plan": {
                    "objectives": ["objetivo 1", "objetivo 2"],
                    "recommended_resources": ["recurso 1", "recurso 2"],
                    "schedule": {
                        "week_1": "actividades",
                        "week_2": "actividades"
                    }
                }
            }

            Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.`

        const systemMessage = `Eres un experto en crear planes de estudio personalizados. 
        Tu respuesta DEBE ser ÚNICAMENTE un objeto JSON válido con el formato especificado.
        NO incluyas explicaciones, markdown, ni texto adicional. SOLO el JSON.`

        const response = await this.openai.chat.completions.create({
            model: 'amazon/nova-2-lite-v1:free',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: prompt }
            ],
        })
        const content = response.choices[0].message?.content
        if (!content) {
            throw new InternalServerErrorException('No response from OpenAI');
        }

        return this.parseStudyPlanResponse(content);
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

    private parseFlashCardsResponse(content: string): { subject: string, definition: string }[] {
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

    private parseStudyPlanResponse(content: string): {
        objectives: string[],
        recommended_resources: string[],
        schedule: { [key: string]: string }
    } {
        const cleanedContent = this.cleanMarkdown(content);
        try {
            const parsed = JSON.parse(cleanedContent);
            return parsed.study_plan;  
        } catch (error) {
            const jsonMatch = cleanedContent.match(/\{[\s\S]*"study_plan"[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.study_plan;
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
