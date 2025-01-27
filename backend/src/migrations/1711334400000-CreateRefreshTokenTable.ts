import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRefreshTokenTable1711334400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Yeni tabloyu oluştur
        await queryRunner.createTable(new Table({
            name: "refresh_token",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "token",
                    type: "text",
                    isUnique: true
                },
                {
                    name: "is_valid",
                    type: "boolean",
                    default: true
                },
                {
                    name: "expires_at",
                    type: "timestamp"
                },
                {
                    name: "device_info",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "ip_address",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "user_id",
                    type: "int"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }));

        // Foreign key oluştur
        await queryRunner.createForeignKey("refresh_token", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "user",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Foreign key'i kaldır
        const table = await queryRunner.getTable("refresh_token");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("refresh_token", foreignKey);
        }

        // Tabloyu kaldır
        await queryRunner.dropTable("refresh_token");
    }
} 