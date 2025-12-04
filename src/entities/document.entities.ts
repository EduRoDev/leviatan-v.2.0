import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Subject } from "./subject.entities";
import { Summary } from "./summary.entities";
import { Flashcard } from "./flashcard.entities";
import { Quiz } from "./quiz.entities";
import { ChatHistory } from "./chat-history.entities";
import { CustomStudyPlan } from "./custom-study-plan.entities";

@Entity("documents")
export class Document {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    title: string;

    @Column()
    content: string;

    @Column()
    file_path: string;

    @Column({ nullable: true })
    audio_url: string;

    @ManyToOne(() => Subject, subject => subject.documents)
    @JoinColumn({ name: "subject_id" })
    subject: Subject;

    @OneToMany(() => Summary, summary => summary.document, { cascade: true })
    summaries: Summary[];

    @OneToMany(() => Flashcard, flashcard => flashcard.document, { cascade: true })
    flashcards: Flashcard[];

    @OneToMany(() => Quiz, quiz => quiz.document, { cascade: true })
    quizzes: Quiz[];

    @OneToMany(() => ChatHistory, chat => chat.document, { cascade: true })
    chat_histories: ChatHistory[];

    @OneToMany(() => CustomStudyPlan, plan => plan.document, { cascade: true })
    study_plans: CustomStudyPlan[];
}