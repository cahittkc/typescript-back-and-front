import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { IsEmail } from "class-validator";
import { RefreshToken } from './RefreshToken';
import { Role } from './Role';
import { Project } from './Project';
import { Proposal } from './Proposal';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: false })
    username: string;

    @Column({ nullable: false })
    firstName: string;

    @Column({ nullable: false })
    lastName: string;

    @Column({ unique: true, nullable: false })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @Column({ nullable: false })
    password: string;

    @OneToOne(() => Role, role => role.user, { eager: true })
    @JoinColumn()
    role: Role;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ type: 'simple-array', nullable: true })
    skills: string[];

    @Column({ type: 'text', nullable: true })
    experience: string;

    @Column({ nullable: true })
    hourlyRate: number;

    @Column({ nullable: true })
    portfolio: string;

    @Column({ nullable: true })
    location: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ type: 'simple-array', nullable: true })
    languages: string[];

    @Column({ default: 0 })
    rating: number;

    @Column({ default: 0 })
    completedProjects: number;

    @OneToMany(() => RefreshToken, token => token.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => Project, project => project.client)
    clientProjects: Project[];

    @OneToMany(() => Project, project => project.assignedFreelancer)
    freelancerProjects: Project[];

    @OneToMany(() => Proposal, proposal => proposal.freelancer)
    proposals: Proposal[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 