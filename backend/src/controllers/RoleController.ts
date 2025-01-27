import { Request, Response, NextFunction } from 'express';
import { RoleRepository } from '../repositories/RoleRepository';
import { ApiError } from '../utils/ApiError';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../enums/UserRole';

export class RoleController {
    private roleRepository: RoleRepository;

    constructor() {
        this.roleRepository = new RoleRepository();
    }

    getAllRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roles = await this.roleRepository.findAll();
            // Filter out admin role from the list for non-admin users
            const filteredRoles = req.user.role.name === UserRole.ADMIN 
                ? roles 
                : roles.filter(role => role.name !== UserRole.ADMIN);
            successResponse(res, filteredRoles, 'Roles retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve roles', { error: error.message }));
        }
    };

    getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const role = await this.roleRepository.findById(Number(req.params.id));
            if (!role) {
                throw ApiError.notFound('Role not found');
            }

            // Don't allow non-admin users to view admin role
            if (role.name === UserRole.ADMIN && req.user.role.name !== UserRole.ADMIN) {
                throw ApiError.forbidden('Access denied');
            }

            successResponse(res, role, 'Role retrieved successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to retrieve role', { error: error.message }));
        }
    };

    createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, description } = req.body;

            // Validate if the role name is a valid UserRole
            if (!Object.values(UserRole).includes(name as UserRole)) {
                throw ApiError.badRequest('Invalid role name');
            }

            // Don't allow creating admin role
            if (name === UserRole.ADMIN) {
                throw ApiError.forbidden('Cannot create admin role');
            }

            // Check if role already exists
            const existingRole = await this.roleRepository.findByName(name);
            if (existingRole) {
                throw ApiError.badRequest('Role already exists');
            }

            const role = await this.roleRepository.create({ name, description });
            successResponse(res, role, 'Role created successfully', StatusCodes.CREATED);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create role', { error: error.message }));
        }
    };

    updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);
            const { description } = req.body;

            // Check if role exists
            const existingRole = await this.roleRepository.findById(roleId);
            if (!existingRole) {
                throw ApiError.notFound('Role not found');
            }

            // Don't allow updating admin role
            if (existingRole.name === UserRole.ADMIN) {
                throw ApiError.forbidden('Cannot modify admin role');
            }

            // Only allow updating the description, not the name
            const updatedRole = await this.roleRepository.update(roleId, { description });
            successResponse(res, updatedRole, 'Role updated successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update role', { error: error.message }));
        }
    };

    deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const roleId = Number(req.params.id);

            // Check if role exists
            const existingRole = await this.roleRepository.findById(roleId);
            if (!existingRole) {
                throw ApiError.notFound('Role not found');
            }

            // Don't allow deleting admin role
            if (existingRole.name === UserRole.ADMIN) {
                throw ApiError.forbidden('Cannot delete admin role');
            }

            // Don't allow deleting default roles (CLIENT, FREELANCER)
            if ([UserRole.CLIENT, UserRole.FREELANCER].includes(existingRole.name as UserRole)) {
                throw ApiError.forbidden('Cannot delete default roles');
            }

            await this.roleRepository.delete(roleId);
            successResponse(res, null, 'Role deleted successfully', StatusCodes.OK);
        } catch (error: any) {
            next(error instanceof ApiError ? error : new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete role', { error: error.message }));
        }
    };
} 