import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { AuthService } from '../services/AuthService';
import { ApiError } from '../utils/ApiError';
import { successResponse } from '../utils/responseHandler';
import { StatusCodes } from 'http-status-codes';
import { LoginDto, RegisterDto, RefreshTokenDto } from '../dtos/auth.dto';

export class AuthController {
    private userRepository: UserRepository;
    private refreshTokenRepository: RefreshTokenRepository;
    private authService: AuthService;

    constructor() {
        this.userRepository = new UserRepository();
        this.refreshTokenRepository = new RefreshTokenRepository();
        this.authService = new AuthService();
    }

    private sanitizeUserResponse(user: any) {
        const { password, ...userWithoutPassword } = user;
        if (userWithoutPassword.role) {
            const { users, ...roleWithoutUsers } = userWithoutPassword.role;
            userWithoutPassword.role = roleWithoutUsers;
        }
        return userWithoutPassword;
    }

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData = req.body as RegisterDto;
            const user = await this.authService.register(userData);
            const sanitizedUser = this.sanitizeUserResponse(user);
            successResponse(res, sanitizedUser, 'User registered successfully', StatusCodes.CREATED);
        } catch (error: any) {
            // Handle specific database errors
            if (error.code === '23505') { // PostgreSQL unique violation error code
                // Get the constraint name from the error message
                const constraintMatch = error.detail?.match(/\"(.+?)\"/);
                const constraint = constraintMatch ? constraintMatch[1] : '';
                
                // Get the value that caused the duplicate from the error message
                const valueMatch = error.detail?.match(/=\((.+?)\)/);
                const value = valueMatch ? valueMatch[1] : '';
                
                // Map constraint names to user-friendly field names and messages
                let fieldName = 'field';
                let message = 'Registration failed due to duplicate entry';
                
                if (constraint.includes('users_email_key')) {
                    fieldName = 'email';
                    message = `The email address "${value}" is already registered. Please use a different email or try logging in.`;
                } else if (constraint.includes('users_username_key')) {
                    fieldName = 'username';
                    message = `The username "${value}" is already taken. Please choose a different username.`;
                }
                
                next(new ApiError(StatusCodes.CONFLICT, message, { 
                    error: error.message,
                    field: fieldName,
                    value: value
                }));
            } else if (error instanceof ApiError) {
                // If it's already an ApiError, pass it through
                next(error);
            } else {
                // For other errors, create a generic error message
                next(new ApiError(
                    StatusCodes.BAD_REQUEST,
                    'Registration failed. Please check your input and try again.',
                    { error: error.message }
                ));
            }
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { emailOrUsername, password } = req.body as LoginDto;
            const { user, accessToken, refreshToken, expiresIn } = await this.authService.login(emailOrUsername, password, req);

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const sanitizedUser = this.sanitizeUserResponse(user);
            successResponse(res, { 
                ...sanitizedUser, 
                accessToken,
                expiresIn
            }, 'Login successful', StatusCodes.OK);
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.UNAUTHORIZED, 
                    'Invalid credentials. Please check your email/username and password.',
                    { error: error.message }
                ));
            }
        }
    };

    refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { refreshToken } = req.body as RefreshTokenDto;
            const result = await this.authService.refresh(refreshToken);

            // Set new refresh token in HTTP-only cookie
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            successResponse(res, { 
                accessToken: result.accessToken,
                expiresIn: result.expiresIn
            }, 'Token refreshed successfully', StatusCodes.OK);
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.UNAUTHORIZED, 
                    'Token refresh failed. Please log in again.',
                    { error: error.message }
                ));
            }
        }
    };

    logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (refreshToken) {
                await this.authService.logout(refreshToken);
            }

            // Clear refresh token cookie
            res.clearCookie('refreshToken');
            successResponse(res, { 
                message: 'Logged out successfully' 
            }, 'Logout successful', StatusCodes.OK);
        } catch (error: any) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(
                    StatusCodes.INTERNAL_SERVER_ERROR, 
                    'Logout failed. Please try again.',
                    { error: error.message }
                ));
            }
        }
    };
} 