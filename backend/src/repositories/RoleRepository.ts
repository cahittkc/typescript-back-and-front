import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role';
import { UserRole } from '../enums/UserRole';

export class RoleRepository {
    private repository: Repository<Role>;

    constructor() {
        this.repository = AppDataSource.getRepository(Role);
    }

    async create(data: Partial<Role>): Promise<Role> {
        const role = this.repository.create(data);
        return await this.repository.save(role);
    }

    async findById(id: number): Promise<Role | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['users']
        });
    }

    async findByName(name: UserRole): Promise<Role | null> {
        return await this.repository.findOne({
            where: { name },
            relations: ['users']
        });
    }

    async findAll(): Promise<Role[]> {
        return await this.repository.find({
            relations: ['users']
        });
    }

    async update(id: number, data: Partial<Role>): Promise<Role> {
        await this.repository.update(id, data);
        const updatedRole = await this.findById(id);
        if (!updatedRole) {
            throw new Error('Role not found after update');
        }
        return updatedRole;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async findOrCreate(name: UserRole, description?: string): Promise<Role> {
        let role = await this.findByName(name);
        
        if (!role) {
            role = await this.create({
                name,
                description: description || `${name} role`
            });
        }

        return role;
    }
} 