import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";
import { ProjectStatus } from "../enums/ProjectStatus";
import { ProjectCategory } from "../enums/ProjectCategory";
import type { Proposal } from "./Proposal";

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.OPEN
    })
    status: ProjectStatus;

    @Column({
        type: 'enum',
        enum: ProjectCategory
    })
    category: ProjectCategory;

    @Column('decimal', { precision: 10, scale: 2 })
    budget: number;

    @Column()
    deadline: Date;

    @Column({ type: 'simple-array', nullable: true })
    requiredSkills: string[];

    @Column({ type: 'text', nullable: true })
    attachments: string;

    @ManyToOne(() => User, user => user.clientProjects, { nullable: false })
    client: User;

    @ManyToOne(() => User, user => user.freelancerProjects, { nullable: true })
    assignedFreelancer: User;

    @OneToMany('Proposal', 'project')
    proposals: Proposal[];

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ nullable: true })
    completedAt: Date;

    @Column({ type: 'text', nullable: true })
    cancellationReason: string;

    @Column({ nullable: true })
    cancelledAt: Date;

    @Column({ type: 'text', nullable: true })
    completionNotes: string;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    clientRating: number;

    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    freelancerRating: number;

    @Column({ type: 'text', nullable: true })
    clientReview: string;

    @Column({ type: 'text', nullable: true })
    freelancerReview: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 