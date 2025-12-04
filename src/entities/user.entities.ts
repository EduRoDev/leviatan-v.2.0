import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Subject } from "./subject.entities";
import { QuizAttempt } from "./quiz-attempt.entities";
import { ChatHistory } from "./chat-history.entities";
import { CustomStudyPlan } from "./custom-study-plan.entities";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 30 })
    name: string;

    @Column({ length: 30 })
    last_name: string;

    @Column({ length: 50, unique: true })
    email: string;

    @Column({ length: 255 })
    password: string;

    @OneToMany(() => Subject, subject => subject.user, { cascade: true })
    subjects: Subject[];

    @OneToMany(() => QuizAttempt, attempt => attempt.user)
    quiz_attempts: QuizAttempt[];

    @OneToMany(() => ChatHistory, chat => chat.user, { cascade: true })
    chat_histories: ChatHistory[];

    @OneToMany(() => CustomStudyPlan, plan => plan.user, { cascade: true })
    study_plans: CustomStudyPlan[];
}