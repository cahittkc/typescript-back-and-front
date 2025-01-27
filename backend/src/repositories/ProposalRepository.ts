import { Repository } from 'typeorm';
import { Proposal } from '../entities/Proposal';
import { AppDataSource } from '../config/database';
import { ProposalStatus } from '../enums/ProposalStatus';

export class ProposalRepository {
    private repository: Repository<Proposal>;

    constructor() {
        this.repository = AppDataSource.getRepository(Proposal);
    }

    async create(data: Partial<Proposal>): Promise<Proposal> {
        const proposal = this.repository.create(data);
        return await this.repository.save(proposal);
    }

    async findAll(): Promise<Proposal[]> {
        return await this.repository.find({
            relations: ['project', 'freelancer']
        });
    }

    async findById(id: number): Promise<Proposal | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['project', 'freelancer']
        });
    }

    async findByProject(projectId: number): Promise<Proposal[]> {
        return await this.repository.find({
            where: { project: { id: projectId } },
            relations: ['project', 'freelancer']
        });
    }

    async findByFreelancer(freelancerId: number): Promise<Proposal[]> {
        return await this.repository.find({
            where: { freelancer: { id: freelancerId } },
            relations: ['project', 'freelancer']
        });
    }

    async findByStatus(status: ProposalStatus): Promise<Proposal[]> {
        return await this.repository.find({
            where: { status },
            relations: ['project', 'freelancer']
        });
    }

    async update(id: number, data: Partial<Proposal>): Promise<Proposal> {
        await this.repository.update(id, data);
        const updatedProposal = await this.findById(id);
        if (!updatedProposal) {
            throw new Error('Proposal not found after update');
        }
        return updatedProposal;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async acceptProposal(id: number, clientNote?: string): Promise<Proposal> {
        const proposal = await this.findById(id);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        proposal.status = ProposalStatus.ACCEPTED;
        proposal.isAccepted = true;
        if (clientNote) {
            proposal.clientNote = clientNote;
        }

        return await this.repository.save(proposal);
    }

    async rejectProposal(id: number, clientNote?: string): Promise<Proposal> {
        const proposal = await this.findById(id);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        proposal.status = ProposalStatus.REJECTED;
        if (clientNote) {
            proposal.clientNote = clientNote;
        }

        return await this.repository.save(proposal);
    }

    async withdrawProposal(id: number): Promise<Proposal> {
        const proposal = await this.findById(id);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        proposal.status = ProposalStatus.WITHDRAWN;
        return await this.repository.save(proposal);
    }
} 