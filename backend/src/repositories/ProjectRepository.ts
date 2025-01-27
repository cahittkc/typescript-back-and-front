import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Project } from '../entities/Project';
import { AppDataSource } from '../config/database';
import { ProjectStatus } from '../enums/ProjectStatus';
import { User } from '../entities/User';
import { GetProjectsQueryDto } from '../dtos/project.dto';

export class ProjectRepository {
    private repository: Repository<Project>;

    constructor() {
        this.repository = AppDataSource.getRepository(Project);
    }

    async create(data: Partial<Project>): Promise<Project> {
        const project = this.repository.create(data);
        await this.repository.save(project);
        
        // Fetch the project with selected client fields
        return await this.repository.findOne({
            where: { id: project.id },
            relations: ['client'],
            select: {
                client: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            }
        }) as Project;
    }

    async findAll(query: GetProjectsQueryDto): Promise<{ projects: Project[], total: number }> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        const where: FindOptionsWhere<Project> = {};

        if (query.status) {
            where.status = query.status;
        }

        if (query.category) {
            where.category = query.category;
        }

        if (query.minBudget || query.maxBudget) {
            where.budget = Between(
                query.minBudget || 0,
                query.maxBudget || Number.MAX_SAFE_INTEGER
            );
        }

        if (query.startDate || query.endDate) {
            where.deadline = Between(
                query.startDate ? new Date(query.startDate) : new Date(0),
                query.endDate ? new Date(query.endDate) : new Date('2100-01-01')
            );
        }

        const [projects, total] = await this.repository.findAndCount({
            where,
            relations: ['client', 'assignedFreelancer', 'proposals'],
            skip,
            take: limit,
            order: {
                createdAt: 'DESC'
            }
        });

        return { projects, total };
    }

    async findById(id: number): Promise<Project | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['client', 'assignedFreelancer', 'proposals']
        });
    }

    async findByClient(clientId: number): Promise<Project[]> {
        return await this.repository.find({
            where: { client: { id: clientId } },
            relations: ['client', 'assignedFreelancer', 'proposals']
        });
    }

    async findByFreelancer(freelancerId: number): Promise<Project[]> {
        return await this.repository.find({
            where: { assignedFreelancer: { id: freelancerId } },
            relations: ['client', 'assignedFreelancer', 'proposals']
        });
    }

    async findByStatus(status: ProjectStatus): Promise<Project[]> {
        return await this.repository.find({
            where: { status },
            relations: ['client', 'assignedFreelancer', 'proposals']
        });
    }

    async update(id: number, data: Partial<Project>): Promise<Project> {
        await this.repository.update(id, data);
        const updatedProject = await this.findById(id);
        if (!updatedProject) {
            throw new Error('Project not found after update');
        }
        return updatedProject;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async assignFreelancer(projectId: number, freelancer: User): Promise<Project> {
        const project = await this.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        return await this.update(projectId, {
            assignedFreelancer: freelancer,
            status: ProjectStatus.IN_PROGRESS
        });
    }

    async completeProject(projectId: number, data: { 
        completionNotes: string;
        freelancerRating: number;
        freelancerReview: string;
    }): Promise<Project> {
        const project = await this.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        return await this.update(projectId, {
            status: ProjectStatus.COMPLETED,
            isCompleted: true,
            completedAt: new Date(),
            ...data
        });
    }

    async cancelProject(projectId: number, cancellationReason: string): Promise<Project> {
        const project = await this.findById(projectId);
        if (!project) {
            throw new Error('Project not found');
        }

        return await this.update(projectId, {
            status: ProjectStatus.CANCELLED,
            cancellationReason,
            cancelledAt: new Date()
        });
    }

    async hasProposal(projectId: number, freelancerId: number): Promise<boolean> {
        const project = await this.repository.findOne({
            where: { id: projectId },
            relations: ['proposals', 'proposals.freelancer']
        });

        if (!project) {
            return false;
        }

        return project.proposals.some(proposal => proposal.freelancer.id === freelancerId);
    }
} 