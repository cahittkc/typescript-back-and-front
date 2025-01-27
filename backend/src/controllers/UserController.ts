import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { ApiError } from '../utils/ApiError';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../enums/UserRole';
import { User } from '../entities/User';

export class UserController {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // req.user JWT middleware'den geliyor
            const user = await this.userRepository.findById(req.user.id);
            if (!user) {
                throw ApiError.notFound('User not found');
            }

            // Remove sensitive information
            const { password, ...userWithoutPassword } = user;
            
            successResponse(res, userWithoutPassword, 'Current user retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error);
        }
    };

    createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.userRepository.create(req.body);
            const { password, ...userWithoutPassword } = user;
            successResponse(res, userWithoutPassword, 'User created successfully', StatusCodes.CREATED);
        } catch (error: any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user: ' + error.message));
        }
    };

    getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { role, skills } = req.query;
            let users = await this.userRepository.findAll();

            // Filter by role if specified
            if (role) {
                users = users.filter(user => user.role.name === role);
            }

            // Filter by skills if specified
            if (skills) {
                const requiredSkills = (skills as string).split(',');
                users = users.filter(user => 
                    user.skills && requiredSkills.every(skill => 
                        user.skills.includes(skill)
                    )
                );
            }

            const usersWithoutPassword = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            
            successResponse(res, usersWithoutPassword, 'Users retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve users', { error: error.message }));
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = await this.userRepository.findById(Number(req.params.id));
            if (!user) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
            }
            const { password, ...userWithoutPassword } = user;
            successResponse(res, userWithoutPassword, 'User retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve user', { error: error.message }));
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Check if user exists
            const existingUser = await this.userRepository.findById(Number(req.params.id));
            if (!existingUser) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
            }

            // Prevent role change through update
            if (req.body.role && req.body.role !== existingUser.role.name) {
                throw new ApiError(StatusCodes.FORBIDDEN, 'Role cannot be changed through update');
            }

            const user = await this.userRepository.update(Number(req.params.id), req.body);
            const { password, ...userWithoutPassword } = user;
            successResponse(res, userWithoutPassword, 'User updated successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update user', { error: error.message }));
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const deleted = await this.userRepository.delete(Number(req.params.id));
            if (!deleted) {
                throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
            }
            successResponse(res, null, 'User deleted successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete user', { error: error.message }));
        }
    };

    // New methods for freelancer platform
    getFreelancers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const users = await this.userRepository.findByRole(UserRole.FREELANCER);
            const usersWithoutPassword = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            successResponse(res, usersWithoutPassword, 'Freelancers retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve freelancers', { error: error.message }));
        }
    };

    getClients = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const users = await this.userRepository.findByRole(UserRole.CLIENT);
            const usersWithoutPassword = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            successResponse(res, usersWithoutPassword, 'Clients retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve clients', { error: error.message }));
        }
    };

    updateUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user.id;
            const allowedFields = [
                'bio', 'skills', 'experience', 'hourlyRate', 
                'portfolio', 'location', 'phoneNumber', 'languages'
            ] as const;

            type AllowedField = typeof allowedFields[number];
            const updateData: Partial<Record<AllowedField, any>> = {};

            // Type-safe way to filter and copy fields
            for (const key of allowedFields) {
                if (key in req.body) {
                    updateData[key] = req.body[key];
                }
            }

            const user = await this.userRepository.update(userId, updateData as Partial<User>);
            const { password, ...userWithoutPassword } = user;
            successResponse(res, userWithoutPassword, 'Profile updated successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update profile', { error: error.message }));
        }
    };
} 