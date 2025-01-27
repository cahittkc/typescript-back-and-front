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

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData = req.body as RegisterDto;
            const user = await this.authService.register(userData);
            const { password, ...userWithoutPassword } = user;
            successResponse(res, userWithoutPassword, 'User registered successfully', StatusCodes.CREATED);
        } catch (error: any) {
            next(new ApiError(StatusCodes.BAD_REQUEST, 'Registration failed', { error: error.message }));
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { emailOrUsername, password } = req.body as LoginDto;
            const { user, accessToken, refreshToken } = await this.authService.login(emailOrUsername, password, req);

            // Set refresh token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            const { password: _, ...userWithoutPassword } = user;
            successResponse(res, { user: userWithoutPassword, accessToken }, 'Login successful', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.UNAUTHORIZED, 'Login failed', { error: error.message }));
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

            successResponse(res, { accessToken: result.accessToken }, 'Token refreshed successfully', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.UNAUTHORIZED, 'Token refresh failed', { error: error.message }));
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
            successResponse(res, null, 'Logout successful', StatusCodes.OK);
        } catch (error: any) {
            next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Logout failed', { error: error.message }));
        }
    };
} 