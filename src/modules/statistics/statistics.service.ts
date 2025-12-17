import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from 'src/entities/quiz-attempt.entities';
import { QuizAnswer } from 'src/entities/quiz-answer.entities';
import { Quiz } from 'src/entities/quiz.entities';
import { Question } from 'src/entities/question.entities';

interface AnswerData {
    question_id: number;
    selected_option: string;
}

@Injectable()
export class StatisticsService {

    constructor(
        @InjectRepository(QuizAttempt)
        private readonly attemptRepo: Repository<QuizAttempt>,
        
        @InjectRepository(QuizAnswer)
        private readonly answerRepo: Repository<QuizAnswer>,
        
        @InjectRepository(Quiz)
        private readonly quizRepo: Repository<Quiz>,
        
        @InjectRepository(Question)
        private readonly questionRepo: Repository<Question>
    ) {}

    async recordQuizAttempt(
        userId: number,
        quizId: number,
        answers: AnswerData[],
        timeTaken?: number
    ): Promise<QuizAttempt> {
        // Verificar que el quiz existe
        const quiz = await this.quizRepo.findOne({ where: { id: quizId } });
        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${quizId} not found`);
        }

        // Obtener todas las preguntas del quiz
        const questions = await this.questionRepo.find({ 
            where: { quiz: { id: quizId } } 
        });
        
        const totalQuestions = questions.length;
        let correctAnswers = 0;

        // Crear el intento
        const attempt = this.attemptRepo.create({
            user: { id: userId },
            quiz: { id: quizId },
            total_questions: totalQuestions,
            correct_answers: 0,
            score: 0,
            time_taken: timeTaken,
            completed_at: new Date()
        });

        await this.attemptRepo.save(attempt);

        // Procesar las respuestas
        const quizAnswers: QuizAnswer[] = [];
        
        for (const data of answers) {
            const question = questions.find(q => q.id === data.question_id);
            if (!question) continue;

            const isCorrect = question.correct_option === data.selected_option;
            if (isCorrect) correctAnswers++;

            const quizAnswer = this.answerRepo.create({
                attempt: { id: attempt.id },
                question: { id: data.question_id },
                selected_option: data.selected_option,
                is_correct: isCorrect
            });

            quizAnswers.push(quizAnswer);
        }

        // Calcular score
        const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
        attempt.correct_answers = correctAnswers;
        attempt.score = score;

        await this.answerRepo.save(quizAnswers);
        await this.attemptRepo.save(attempt);

        return attempt;
    }

    async getUserStatistics(userId: number): Promise<{
        total_quizzes: number;
        average_score: number;
        total_time: number;
        best_score: number;
        worst_score: number;
        recent_attempts: any[];
    }> {
        const attempts = await this.attemptRepo.find({
            where: { user: { id: userId } },
            relations: ['quiz'],
            order: { completed_at: 'DESC' }
        });

        if (attempts.length === 0) {
            return {
                total_quizzes: 0,
                average_score: 0,
                total_time: 0,
                best_score: 0,
                worst_score: 0,
                recent_attempts: []
            };
        }

        const scores = attempts.map(a => a.score);
        const times = attempts.filter(a => a.time_taken).map(a => a.time_taken);

        return {
            total_quizzes: attempts.length,
            average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
            total_time: times.reduce((a, b) => a + b, 0),
            best_score: Math.max(...scores),
            worst_score: Math.min(...scores),
            recent_attempts: this.formatRecentAttempts(attempts.slice(0, 5))
        };
    }

    async getUserProgressBySubject(userId: number): Promise<Array<{
        document_id: number;
        subject_id: number;
        total_attempts: number;
        average_score: number;
    }>> {
        const result = await this.attemptRepo
            .createQueryBuilder('attempt')
            .select('quiz.document_id', 'document_id')
            .addSelect('document.subject_id', 'subject_id')
            .addSelect('COUNT(attempt.id)', 'total_attempts')
            .addSelect('AVG(attempt.score)', 'average_score')
            .innerJoin('attempt.quiz', 'quiz')
            .innerJoin('quiz.document', 'document')
            .where('attempt.user_id = :userId', { userId })
            .groupBy('quiz.document_id')
            .addGroupBy('document.subject_id')
            .getRawMany();

        return result.map(row => ({
            document_id: parseInt(row.document_id),
            subject_id: parseInt(row.subject_id),
            total_attempts: parseInt(row.total_attempts),
            average_score: parseFloat(parseFloat(row.average_score).toFixed(2))
        }));
    }

    async getQuizStatistics(quizId: number): Promise<{
        total_attempts: number;
        average_score: number;
        pass_rate: number;
        difficult_questions: any[];
    }> {
        const attempts = await this.attemptRepo.find({
            where: { quiz: { id: quizId } }
        });

        if (attempts.length === 0) {
            return {
                total_attempts: 0,
                average_score: 0,
                pass_rate: 0,
                difficult_questions: []
            };
        }

        const scores = attempts.map(a => a.score);
        const passRate = (scores.filter(s => s >= 70).length / scores.length) * 100;

        return {
            total_attempts: attempts.length,
            average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
            pass_rate: passRate,
            difficult_questions: await this.identifyDifficultQuestions(quizId)
        };
    }

    private async identifyDifficultQuestions(quizId: number): Promise<Array<{
        question_id: number;
        question_text: string;
        error_rate: number;
    }>> {
        const result = await this.answerRepo
            .createQueryBuilder('answer')
            .select('question.id', 'question_id')
            .addSelect('question.question_text', 'question_text')
            .addSelect('COUNT(answer.id)', 'total_answers')
            .addSelect('SUM(CASE WHEN answer.is_correct = true THEN 1 ELSE 0 END)', 'correct_answers')
            .innerJoin('answer.question', 'question')
            .where('question.quiz_id = :quizId', { quizId })
            .groupBy('question.id')
            .addGroupBy('question.question_text')
            .getRawMany();

        const difficultQuestions = result
            .map(row => {
                const totalAnswers = parseInt(row.total_answers);
                const correctAnswers = parseInt(row.correct_answers);
                const errorRate = ((totalAnswers - correctAnswers) / totalAnswers) * 100;

                return {
                    question_id: parseInt(row.question_id),
                    question_text: row.question_text.substring(0, 100) + '...',
                    error_rate: parseFloat(errorRate.toFixed(2))
                };
            })
            .filter(q => q.error_rate > 50)
            .sort((a, b) => b.error_rate - a.error_rate);

        return difficultQuestions;
    }

    private formatRecentAttempts(attempts: QuizAttempt[]): Array<{
        quiz_id: number;
        score: number;
        time_taken: number;
        completed_at: string;
    }> {
        return attempts.map(attempt => ({
            quiz_id: attempt.quiz?.id || 0,
            score: attempt.score,
            time_taken: attempt.time_taken,
            completed_at: attempt.completed_at.toISOString()
        }));
    }
}