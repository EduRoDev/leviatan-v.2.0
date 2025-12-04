import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Quiz } from "./quiz.entities"
import { Option } from "./option.entities"

@Entity("questions")
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @Column("text")
    question_text: string
    
    @Column()
    correct_option: string
    
    @ManyToOne(() => Quiz, quiz => quiz.questions)
    @JoinColumn({ name: "quiz_id" })
    quiz: Quiz 

    @OneToMany(() => Option, option => option.question, { cascade: true })
    options: Option[];
}