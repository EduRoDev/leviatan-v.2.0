import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizAttempt } from "./quiz-attempt.entities";
import { Question } from "./question.entities";

@Entity("quiz_answers")
export class QuizAnswer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    selected_option: string;

    @Column()
    is_correct: boolean;

    @ManyToOne(() => QuizAttempt, attempt => attempt.answers)
    @JoinColumn({ name: "attempt_id" })
    attempt: QuizAttempt;

    @ManyToOne(() => Question)
    @JoinColumn({ name: "question_id" })
    question: Question;
}
