import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Quiz } from "./quiz.entities";
import { User } from "./user.entities";
import { QuizAnswer } from "./quiz-answer.entities";

@Entity("quiz_attempts")
export class QuizAttempt {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "float" })
    score: number;

    @Column()
    total_questions: number;

    @Column()
    correct_answers: number;

    @Column({ nullable: true })
    time_taken: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    completed_at: Date;

    @ManyToOne(() => Quiz)
    @JoinColumn({ name: "quiz_id" })
    quiz: Quiz;

    @ManyToOne(() => User, user => user.quiz_attempts)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => QuizAnswer, answer => answer.attempt, { cascade: true })
    answers: QuizAnswer[];
}
