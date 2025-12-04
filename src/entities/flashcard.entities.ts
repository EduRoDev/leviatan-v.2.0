import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./document.entities";

@Entity("flashcards")
export class Flashcard {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;

    @Column()
    answer: string;

    @OneToOne(() => Document, document => document.flashcard)
    @JoinColumn({ name: "document_id" })
    document: Document;
}