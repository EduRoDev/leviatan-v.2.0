import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./document.entities";

@Entity("flashcards")
export class Flashcard {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("text")
    question: string;

    @Column("text")
    answer: string;

    @ManyToOne(() => Document, document => document.flashcards)
    @JoinColumn({ name: "document_id" })
    document: Document;
}