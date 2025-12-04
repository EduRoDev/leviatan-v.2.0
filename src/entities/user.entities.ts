import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Subject } from "./subject.entities";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    @Column()
    last_name: string;
    @Column()
    email: string;
    @Column()
    password: string;

    @OneToMany(() => Subject, subject => subject.user)
    subjects: Subject[];
}