import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import type { Project } from "./Project";
import { ProposalStatus } from "../enums/ProposalStatus";

@Entity()
export class Proposal {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne('Project', 'proposals', { nullable: false })
    project: Project;

    @ManyToOne(() => User, { nullable: false })
    freelancer: User;

    @Column('decimal', { precision: 10, scale: 2 })
    bidAmount: number;

    @Column()
    deliveryTime: number; // in days

    @Column('text')
    coverLetter: string;

    @Column({
        type: 'enum',
        enum: ProposalStatus,
        default: ProposalStatus.PENDING
    })
    status: ProposalStatus;

    @Column({ type: 'simple-array', nullable: true })
    attachments: string[];

    @Column({ nullable: true })
    clientNote: string;

    @Column({ default: false })
    isAccepted: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 