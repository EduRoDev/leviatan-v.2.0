import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./document.entities";
import { Question } from "./question.entities";

@Entity("quizzes")
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    title: string;

    @ManyToOne(() => Document, document => document.quizzes)
    @JoinColumn({ name: "document_id" })
    document: Document;

    @OneToMany(() => Question, question => question.quiz, { cascade: true })
    questions: Question[];
}