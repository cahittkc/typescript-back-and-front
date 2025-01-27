import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, REFRESH_TOKEN_SECRET, jwtOptions, refreshTokenOptions, JWT_EXPIRES_IN } from '../config/auth';
import { UserRepository } from '../repositories/UserRepository';
import { RoleRepository } from '../repositories/RoleRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { ApiError } from '../utils/ApiError';
import { User } from '../entities/User';
import { StatusCodes } from 'http-status-codes';
import { Request } from 'express';
import { RegisterDto } from '../dtos/auth.dto';

export class AuthService {
    private userRepository: UserRepository;
    private roleRepository: RoleRepository;
    private refreshTokenRepository: RefreshTokenRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.roleRepository = new RoleRepository();
        this.refreshTokenRepository = new RefreshTokenRepository();
    }

    private parseExpiresIn(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([mhd])$/);
        if (!match) {
            throw new Error('Invalid expiresIn format');
        }

        const [, value, unit] = match;
        const numValue = parseInt(value, 10);

        switch (unit) {
            case 'm': // minutes
                return numValue * 60;
            case 'h': // hours
                return numValue * 60 * 60;
            case 'd': // days
                return numValue * 24 * 60 * 60;
            default:
                throw new Error('Invalid time unit');
        }
    }

    async register(userData: RegisterDto): Promise<User> {
        // Check if email exists
        const existingUserByEmail = await this.userRepository.findByEmail(userData.email);
        if (existingUserByEmail) {
            throw ApiError.conflict('Email already exists');
        }

        // Check if username exists
        const existingUserByUsername = await this.userRepository.findByUsername(userData.username);
        if (existingUserByUsername) {
            throw ApiError.conflict('Username already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create or get role
        const role = await this.roleRepository.findOrCreate(userData.role);

        // Create user with hashed password and role
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            role
        });

        return user;
    }

    async login(emailOrUsername: string, password: string, req: Request): Promise<{ 
        user: Partial<User>, 
        accessToken: string,
        refreshToken: string,
        expiresIn: number
    }> {
        // Find user by email or username
        const user = await this.userRepository.findByEmailOrUsername(emailOrUsername);
        if (!user) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw ApiError.unauthorized('Invalid credentials');
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        // Calculate expiration time in seconds
        const expiresIn = this.parseExpiresIn(JWT_EXPIRES_IN);

        // Save refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

        await this.refreshTokenRepository.create({
            token: refreshToken,
            user: user,
            expiresAt,
            deviceInfo: req.headers['user-agent'],
            ipAddress: req.ip
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
            expiresIn
        };
    }

    async refresh(refreshToken: string): Promise<{ 
        accessToken: string,
        refreshToken: string,
        expiresIn: number
    }> {
        try {
            // Find and validate refresh token
            const tokenDoc = await this.refreshTokenRepository.findByToken(refreshToken);
            if (!tokenDoc || !tokenDoc.isValid || tokenDoc.expiresAt < new Date()) {
                throw ApiError.unauthorized('Invalid refresh token');
            }

            // Generate new tokens
            const newAccessToken = this.generateAccessToken(tokenDoc.user);
            const newRefreshToken = this.generateRefreshToken(tokenDoc.user);

            // Calculate expiration time in seconds
            const expiresIn = this.parseExpiresIn(JWT_EXPIRES_IN);

            // Invalidate old refresh token
            await this.refreshTokenRepository.invalidateToken(refreshToken);

            // Save new refresh token
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await this.refreshTokenRepository.create({
                token: newRefreshToken,
                user: tokenDoc.user,
                expiresAt,
                deviceInfo: tokenDoc.deviceInfo,
                ipAddress: tokenDoc.ipAddress
            });

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw ApiError.unauthorized('Invalid refresh token');
        }
    }

    async logout(refreshToken: string): Promise<void> {
        await this.refreshTokenRepository.invalidateToken(refreshToken);
    }

    private generateAccessToken(user: User): string {
        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role.name
        };

        return jwt.sign(payload, JWT_SECRET, jwtOptions);
    }

    private generateRefreshToken(user: User): string {
        const payload = {
            id: user.id,
            role: user.role.name
        };

        return jwt.sign(payload, REFRESH_TOKEN_SECRET, refreshTokenOptions);
    }

    static verifyToken(token: string): any {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw ApiError.unauthorized('Invalid token');
        }
    }
} 