import { Request, Response, NextFunction } from 'express';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { UserRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/ApiError';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../enums/UserRole';
import { ProjectStatus } from '../enums/ProjectStatus';
import { GetProjectsQueryDto } from '../dtos/project.dto';
import { Project } from '../entities/Project';

export class ProjectController {
    private projectRepository: ProjectRepository;
    private userRepository: UserRepository;

    constructor() {
        this.projectRepository = new ProjectRepository();
        this.userRepository = new UserRepository();
    }

    private sanitizeProjectResponse(project: any) {
        const sanitizedProject = { ...project };
        
        if (project.client) {
            const { password, role, ...clientData } = project.client;
            sanitizedProject.client = clientData;
        }
        
        if (project.assignedFreelancer) {
            const { password, role, ...freelancerData } = project.assignedFreelancer;
            sanitizedProject.assignedFreelancer = freelancerData;
        }

        if (project.proposals) {
            sanitizedProject.proposals = project.proposals.map((proposal: any) => {
                if (proposal.freelancer) {
                    const { password, role, ...freelancerData } = proposal.freelancer;
                    return { 
                        ...proposal, 
                        freelancer: {
                            ...freelancerData,
                            fullName: `${proposal.freelancer.firstName} ${proposal.freelancer.lastName}`
                        }
                    };
                }
                return proposal;
            });
        }

        return sanitizedProject;
    }

    private sanitizeProjectsResponse(projects: any[]) {
        return projects.map(project => this.sanitizeProjectResponse(project));
    }

    createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const client = await this.userRepository.findById(req.user.id);
            if (!client) {
                throw ApiError.notFound('Client not found');
            }

            if (client.role.name !== UserRole.CLIENT && client.role.name !== UserRole.ADMIN) {
                throw ApiError.forbidden('Only clients and admins can create projects');
            }

            const project = await this.projectRepository.create({
                ...req.body,
                client,
                status: ProjectStatus.OPEN
            });

            const sanitizedProject = this.sanitizeProjectResponse(project);
            successResponse(res, sanitizedProject, 'Project created successfully', StatusCodes.CREATED);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create project', { error: error.message }));
        }
    };

    getAllProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = req.query as unknown as GetProjectsQueryDto;
            const { projects, total } = await this.projectRepository.findAll(query);

            const page = query.page || 1;
            const limit = query.limit || 10;
            const totalPages = Math.ceil(total / limit);

            const sanitizedProjects = this.sanitizeProjectsResponse(projects);

            successResponse(res, {
                projects: sanitizedProjects,
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            }, 'Projects retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve projects', { error: error.message }));
        }
    };

    getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) {
                throw ApiError.badRequest('Invalid project ID');
            }

            const project = await this.projectRepository.findById(id);
            if (!project) {
                throw ApiError.notFound('Project not found');
            }

            const sanitizedProject = this.sanitizeProjectResponse(project);
            successResponse(res, sanitizedProject, 'Project retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve project', { error: error.message }));
        }
    };

    getMyProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.userRepository.findById(req.user.id);
            if (!user) {
                throw ApiError.notFound('User not found');
            }

            let projects: Project[] = [];
            if (user.role.name === UserRole.CLIENT) {
                projects = await this.projectRepository.findByClient(user.id);
            } else if (user.role.name === UserRole.FREELANCER) {
                projects = await this.projectRepository.findByFreelancer(user.id);
            }

            const sanitizedProjects = this.sanitizeProjectsResponse(projects);
            successResponse(res, sanitizedProjects, 'Projects retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve projects', { error: error.message }));
        }
    };

    updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const project = await this.projectRepository.findById(Number(req.params.id));
            if (!project) {
                throw ApiError.notFound('Project not found');
            }

            if (project.client.id !== req.user.id) {
                throw ApiError.forbidden('You can only update your own projects');
            }

            if (project.status === ProjectStatus.IN_PROGRESS) {
                const { description, attachments } = req.body;
                const updatedProject = await this.projectRepository.update(project.id, { description, attachments });
                const sanitizedProject = this.sanitizeProjectResponse(updatedProject);
                return successResponse(res, sanitizedProject, 'Project updated successfully', StatusCodes.OK);
            }

            const updatedProject = await this.projectRepository.update(project.id, req.body);
            const sanitizedProject = this.sanitizeProjectResponse(updatedProject);
            successResponse(res, sanitizedProject, 'Project updated successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update project', { error: error.message }));
        }
    };

    deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const project = await this.projectRepository.findById(Number(req.params.id));
            if (!project) {
                throw ApiError.notFound('Project not found');
            }

            // Only the client who created the project can delete it
            if (project.client.id !== req.user.id) {
                throw ApiError.forbidden('You can only delete your own projects');
            }

            // Only allow deleting projects that are OPEN
            if (project.status !== ProjectStatus.OPEN) {
                throw ApiError.forbidden('Only open projects can be deleted');
            }

            await this.projectRepository.delete(project.id);
            successResponse(res, null, 'Project deleted successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete project', { error: error.message }));
        }
    };

    assignFreelancer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { freelancerId } = req.body;
            const projectId = Number(req.params.id);

            const project = await this.projectRepository.findById(projectId);
            if (!project) {
                throw ApiError.notFound('Project not found');
            }

            if (project.client.id !== req.user.id) {
                throw ApiError.forbidden('Only the project owner can assign freelancers');
            }

            if (project.status !== ProjectStatus.OPEN) {
                throw ApiError.badRequest('Only open projects can be assigned a freelancer');
            }

            const freelancer = await this.userRepository.findById(freelancerId);
            if (!freelancer) {
                throw ApiError.notFound('Freelancer not found');
            }

            if (freelancer.role.name !== UserRole.FREELANCER) {
                throw ApiError.badRequest('Selected user is not a freelancer');
            }

            const hasProposal = await this.projectRepository.hasProposal(projectId, freelancerId);
            if (!hasProposal) {
                throw ApiError.badRequest('Selected freelancer has not submitted a proposal for this project');
            }

            const updatedProject = await this.projectRepository.assignFreelancer(projectId, freelancer);
            const sanitizedProject = this.sanitizeProjectResponse(updatedProject);
            successResponse(res, sanitizedProject, 'Freelancer assigned successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to assign freelancer', { error: error.message }));
        }
    };

    completeProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectId = Number(req.params.id);
            const { completionNotes, freelancerRating, freelancerReview } = req.body;
            
            const project = await this.projectRepository.findById(projectId);
            if (!project) {
                throw ApiError.notFound('Project not found');
            }

            if (project.client.id !== req.user.id) {
                throw ApiError.forbidden('Only the project owner can mark the project as complete');
            }

            if (project.status !== ProjectStatus.IN_PROGRESS) {
                throw ApiError.badRequest('Only in-progress projects can be marked as complete');
            }

            const updatedProject = await this.projectRepository.completeProject(projectId, {
                completionNotes,
                freelancerRating,
                freelancerReview
            });

            if (project.assignedFreelancer) {
                await this.userRepository.incrementCompletedProjects(project.assignedFreelancer.id);
            }

            const sanitizedProject = this.sanitizeProjectResponse(updatedProject);
            successResponse(res, sanitizedProject, 'Project marked as complete', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to complete project', { error: error.message }));
        }
    };

    cancelProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectId = Number(req.params.id);
            const { cancellationReason } = req.body;
            
            const project = await this.projectRepository.findById(projectId);
            if (!project) {
                throw ApiError.notFound('Project not found');
            }

            if (project.client.id !== req.user.id) {
                throw ApiError.forbidden('Only the project owner can cancel the project');
            }

            if (project.status === ProjectStatus.COMPLETED) {
                throw ApiError.badRequest('Cannot cancel completed projects');
            }

            const updatedProject = await this.projectRepository.cancelProject(projectId, cancellationReason);
            const sanitizedProject = this.sanitizeProjectResponse(updatedProject);
            successResponse(res, sanitizedProject, 'Project cancelled successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to cancel project', { error: error.message }));
        }
    };

    rateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectId = Number(req.params.id);
            const { rating, review } = req.body;
            
            const project = await this.projectRepository.findById(projectId);
            if (!project) {
                throw ApiError.notFound('Project not found');
            }

            if (project.status !== ProjectStatus.COMPLETED) {
                throw ApiError.badRequest('Only completed projects can be rated');
            }

            const isClient = project.client.id === req.user.id;
            const isFreelancer = project.assignedFreelancer && project.assignedFreelancer.id === req.user.id;

            if (!isClient && !isFreelancer) {
                throw ApiError.forbidden('Only project participants can rate the project');
            }

            const updateData = isClient
                ? { clientRating: rating, clientReview: review }
                : { freelancerRating: rating, freelancerReview: review };

            const updatedProject = await this.projectRepository.update(projectId, updateData);
            const sanitizedProject = this.sanitizeProjectResponse(updatedProject);
            successResponse(res, sanitizedProject, 'Project rated successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to rate project', { error: error.message }));
        }
    };
} 