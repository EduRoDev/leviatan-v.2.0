import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entities";
import { Document } from "./document.entities";

@Entity("custom_study_plans")
export class CustomStudyPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 200 })
    title: string;

    @Column({ length: 50 })
    level: string;

    @Column({ type: "json" })
    content: object;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @ManyToOne(() => User, user => user.study_plans)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Document, document => document.study_plans, { nullable: true })
    @JoinColumn({ name: "document_id" })
    document: Document;
}
