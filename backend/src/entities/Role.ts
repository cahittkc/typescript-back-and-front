import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from "typeorm";
import { UserRole } from "../enums/UserRole";
import { User } from "./User";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: UserRole,
        unique: false
    })
    name: UserRole;

    @Column({ type: 'text', nullable: true })
    description: string;

    @OneToOne(() => User, user => user.role)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 