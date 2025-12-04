import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question.entities";

@Entity("options")
export class Option {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    option_text: string;

    @ManyToOne(() => Question, question => question.options)
    @JoinColumn({ name: "question_id" })
    question:Question
}