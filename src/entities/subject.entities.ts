import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entities";
import { Document } from "./document.entities";

@Entity("subject")
export class Subject {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToOne(() => User, user => user.subjects)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => Document, document => document.subject)
    documents: Document[];
}