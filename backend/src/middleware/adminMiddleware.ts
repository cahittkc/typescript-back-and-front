import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../enums/UserRole';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        // Check if user exists and has role information
        if (!req.user || !req.user.role) {
            throw ApiError.unauthorized('Authentication required');
        }

        // Check if user is admin
        if (req.user.role.name !== UserRole.ADMIN) {
            throw ApiError.forbidden('Only administrators can perform this action');
        }

        next();
    } catch (error) {
        next(error);
    }
}; 