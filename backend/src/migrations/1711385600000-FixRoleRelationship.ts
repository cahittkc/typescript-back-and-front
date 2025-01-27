import { MigrationInterface, QueryRunner } from "typeorm"

export class FixRoleRelationship1711385600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "FK_c28e52f758e7bbc53828db92194";
        `);

        // Drop unique constraints if they exist
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.table_constraints 
                    WHERE constraint_type = 'UNIQUE' 
                    AND table_name = 'user' 
                    AND constraint_name LIKE '%role%'
                ) THEN
                    ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "UQ_e12875dfb3b1d92d7d7c5377e22";
                END IF;
            END $$;
        `);

        // Add new foreign key without unique constraint
        await queryRunner.query(`
            ALTER TABLE "user" 
            ADD CONSTRAINT "FK_user_role_id" 
            FOREIGN KEY ("roleId") 
            REFERENCES "role"("id") 
            ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT IF EXISTS "FK_user_role_id"`);
    }
} 