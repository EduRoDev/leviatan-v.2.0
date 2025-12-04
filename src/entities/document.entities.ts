import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Subject } from "./subject.entities";
import { Summary } from "./summary.entities";
import { Flashcard } from "./flashcard.entities";

@Entity("documents")
export class Document {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    file_path: string;

    @Column()
    audio_path: string;

    @ManyToOne(() => Subject, subject => subject.documents)
    @JoinColumn({ name: "subject_id" })
    subject: Subject;

    @OneToOne(() => Summary, summary => summary.document, { cascade: true, nullable: true })
    summary: Summary;

    @OneToOne(() => Flashcard, flashcard => flashcard.document, { cascade: true, nullable: true })
    flashcard: Flashcard;
}