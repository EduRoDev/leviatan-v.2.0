import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Document } from "./document.entities";

@Entity("summary")
export class Summary {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    content: string;

    @OneToOne(() => Document, document => document.summary)
    @JoinColumn({ name: "document_id" })
    document: Document;
}