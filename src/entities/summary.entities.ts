import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./document.entities";

@Entity("summary")
export class Summary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @ManyToOne(() => Document, document => document.summaries)
    @JoinColumn({ name: "document_id" })
    document: Document;
}