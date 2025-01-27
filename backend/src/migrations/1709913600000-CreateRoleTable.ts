import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";
import { UserRole } from "../enums/UserRole";

export class CreateRoleTable1709913600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Role table
        await queryRunner.createTable(new Table({
            name: "role",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "name",
                    type: "enum",
                    enum: Object.values(UserRole)
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }), true);

        // Add roleId column to User table
        await queryRunner.addColumn("user", new TableColumn({
            name: "roleId",
            type: "int",
            isNullable: true
        }));

        // Add foreign key
        await queryRunner.createForeignKey("user", new TableForeignKey({
            columnNames: ["roleId"],
            referencedColumnNames: ["id"],
            referencedTableName: "role",
            onDelete: "SET NULL"
        }));

        // Remove old role column from User table
        await queryRunner.dropColumn("user", "role");

        // Insert default roles
        await queryRunner.manager.query(`
            INSERT INTO role (name, description) VALUES 
            ('${UserRole.FREELANCER}', 'Freelancer role'),
            ('${UserRole.CLIENT}', 'Client role')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key
        const table = await queryRunner.getTable("user");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("roleId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("user", foreignKey);
        }

        // Remove roleId column
        await queryRunner.dropColumn("user", "roleId");

        // Add back the old role column
        await queryRunner.addColumn("user", new TableColumn({
            name: "role",
            type: "enum",
            enum: Object.values(UserRole),
            default: `'${UserRole.FREELANCER}'`
        }));

        // Drop Role table
        await queryRunner.dropTable("role");
    }
} 