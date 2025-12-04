import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entities";
import { Document } from "./document.entities";

@Entity("chat_histories")
export class ChatHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column()
    response: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    timestamp: Date;

    @ManyToOne(() => User, user => user.chat_histories)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Document, document => document.chat_histories)
    @JoinColumn({ name: "document_id" })
    document: Document;
}
