import { Request, Response, NextFunction } from 'express';
import { ProposalRepository } from '../repositories/ProposalRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/ApiError';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../enums/UserRole';
import { ProjectStatus } from '../enums/ProjectStatus';

export class ProposalController {
    private proposalRepository: ProposalRepository;
    private projectRepository: ProjectRepository;
    private userRepository: UserRepository;

    constructor() {
        this.proposalRepository = new ProposalRepository();
        this.projectRepository = new ProjectRepository();
        this.userRepository = new UserRepository();
    }

    createProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Only freelancers can create proposals
            if (req.user.role !== UserRole.FREELANCER) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Only freelancers can create proposals');
            }

            const freelancer = await this.userRepository.findById(req.user.id);
            if (!freelancer) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Freelancer not found');
            }

            const project = await this.projectRepository.findById(Number(req.body.projectId));
            if (!project) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
            }

            // Check if project is still open
            if (project.status !== ProjectStatus.OPEN) {
                throw new ApiError(StatusCodes.BAD_REQUEST, 'Project is not open for proposals');
            }

            // Check if freelancer already submitted a proposal
            const existingProposal = await this.proposalRepository.findByProject(project.id);
            if (existingProposal.some(p => p.freelancer.id === freelancer.id)) {
                throw new ApiError(StatusCodes.BAD_REQUEST, 'You have already submitted a proposal for this project');
            }

            const proposalData = {
                ...req.body,
                freelancer,
                project
            };

            const proposal = await this.proposalRepository.create(proposalData);
            successResponse(res, proposal, 'Proposal created successfully', StatusCodes.CREATED);
        } catch (error: any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create proposal: ' + error.message));
        }
    };

    getProjectProposals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const project = await this.projectRepository.findById(Number(req.params.projectId));
            if (!project) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Project not found');
            }

            // Only project owner can view all proposals
            if (project.client.id !== req.user.id) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Only project owner can view all proposals');
            }

            const proposals = await this.proposalRepository.findByProject(project.id);
            successResponse(res, proposals, 'Proposals retrieved successfully');
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve proposals: ' + error.message));
        }
    };

    getMyProposals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (req.user.role !== UserRole.FREELANCER) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Only freelancers can view their proposals');
            }

            const proposals = await this.proposalRepository.findByFreelancer(req.user.id);
            successResponse(res, proposals, 'Proposals retrieved successfully');
        } catch (error: any) {
            next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve proposals: ' + error.message));
        }
    };

    updateProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const proposal = await this.proposalRepository.findById(Number(req.params.id));
            if (!proposal) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Proposal not found');
            }

            // Only the freelancer who created the proposal can update it
            if (proposal.freelancer.id !== req.user.id) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Only the proposal owner can update the proposal');
            }

            // Don't allow updating if proposal is already accepted or rejected
            if (proposal.isAccepted) {
                throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot update an accepted proposal');
            }

            // Don't allow updating certain fields
            const { freelancer, project, status, isAccepted, ...updateData } = req.body;

            const updatedProposal = await this.proposalRepository.update(proposal.id, updateData);
            successResponse(res, updatedProposal, 'Proposal updated successfully');
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update proposal: ' + error.message));
        }
    };

    acceptProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const proposal = await this.proposalRepository.findById(Number(req.params.id));
            if (!proposal) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Proposal not found');
            }

            // Only the project owner can accept proposals
            if (proposal.project.client.id !== req.user.id) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Only the project owner can accept proposals');
            }

            // Check if project is still open
            if (proposal.project.status !== ProjectStatus.OPEN) {
                throw new ApiError(StatusCodes.BAD_REQUEST, 'Project is not open for accepting proposals');
            }

            const updatedProposal = await this.proposalRepository.acceptProposal(proposal.id, req.body.clientNote);

            // Assign freelancer to project
            await this.projectRepository.assignFreelancer(proposal.project.id, proposal.freelancer);

            // Reject all other proposals
            const otherProposals = await this.proposalRepository.findByProject(proposal.project.id);
            for (const otherProposal of otherProposals) {
                if (otherProposal.id !== proposal.id) {
                    await this.proposalRepository.rejectProposal(otherProposal.id, 'Another proposal was accepted');
                }
            }

            successResponse(res, updatedProposal, 'Proposal accepted successfully');
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to accept proposal: ' + error.message));
        }
    };

    rejectProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const proposal = await this.proposalRepository.findById(Number(req.params.id));
            if (!proposal) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Proposal not found');
            }

            // Only the project owner can reject proposals
            if (proposal.project.client.id !== req.user.id) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Only the project owner can reject proposals');
            }

            const updatedProposal = await this.proposalRepository.rejectProposal(proposal.id, req.body.clientNote);
            successResponse(res, updatedProposal, 'Proposal rejected successfully');
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to reject proposal: ' + error.message));
        }
    };

    withdrawProposal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const proposal = await this.proposalRepository.findById(Number(req.params.id));
            if (!proposal) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'Proposal not found');
            }

            // Only the freelancer who created the proposal can withdraw it
            if (proposal.freelancer.id !== req.user.id) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Only the proposal owner can withdraw the proposal');
            }

            // Don't allow withdrawing if proposal is already accepted
            if (proposal.isAccepted) {
                throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot withdraw an accepted proposal');
            }

            const updatedProposal = await this.proposalRepository.withdrawProposal(proposal.id);
            successResponse(res, updatedProposal, 'Proposal withdrawn successfully');
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to withdraw proposal: ' + error.message));
        }
    };
} 