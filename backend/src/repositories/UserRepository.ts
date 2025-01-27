import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import { UserRole } from '../enums/UserRole';

export class UserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create(data: Partial<User>): Promise<User> {
        const user = this.repository.create(data);
        return await this.repository.save(user);
    }

    async findAll(): Promise<User[]> {
        return await this.repository.find({
            relations: ['role']
        });
    }

    async findById(id: number): Promise<User | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['role']
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { email },
            relations: ['role']
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { username },
            relations: ['role']
        });
    }

    async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
        return await this.repository.findOne({
            where: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ],
            relations: ['role']
        });
    }

    async findByRole(roleName: UserRole): Promise<User[]> {
        return await this.repository.find({
            where: {
                role: {
                    name: roleName
                }
            },
            relations: ['role']
        });
    }

    async update(id: number, data: Partial<User>): Promise<User> {
        await this.repository.update(id, data);
        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new Error('User not found after update');
        }
        return updatedUser;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async incrementCompletedProjects(id: number): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        return await this.update(id, {
            completedProjects: (user.completedProjects || 0) + 1
        });
    }
} 