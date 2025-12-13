import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Option } from 'src/entities/option.entities';
import { Question } from 'src/entities/question.entities';
import { Quiz } from 'src/entities/quiz.entities';
import { OpenAiService } from 'src/utils/open-ai/open-ai.service';
import { Repository } from 'typeorm';

@Injectable()
export class QuizService {
    constructor(
        private readonly OpenAIService: OpenAiService,

        @InjectRepository(Quiz)
        private readonly quizRepo: Repository<Quiz>,
        
    ){}


    async createQuiz(documentId: number) {
        const quizData = await this.OpenAIService.quizDocument(documentId);
        if (!quizData) {
            throw new BadRequestException('Could not generate quiz from the document');
        }

        const quiz = this.quizRepo.create({
            title: quizData.title,
            document: { id: documentId },
            questions: quizData.questions.map(question => ({
                question_text: question.question_text,
                correct_option: question.correct_option,
                options: question.options.map(opt => ({
                    option_text: opt
                }))
            }))
        })

        const savedQuiz = await this.quizRepo.save(quiz);
        
        return {
            message: 'Quiz created successfully',
            quiz: savedQuiz
        }
    }


    async getQuizByDocument(documentId: number) {
        const quiz = await this.quizRepo.findOne({
            where: { document: { id: documentId } },
            relations: ['questions', 'questions.options']
        });
        if (!quiz) {
            throw new BadRequestException('Quiz not found for the given document');
        }
        return quiz;
    }
}
