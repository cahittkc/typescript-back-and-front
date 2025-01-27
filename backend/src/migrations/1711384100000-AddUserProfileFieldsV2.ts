import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFieldsV21711384100000 implements MigrationInterface {
    name = 'AddUserProfileFieldsV21711384100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop migrations table to start fresh
        await queryRunner.query(`DROP TABLE IF EXISTS migrations`);
        
        // Create enum type for user roles if not exists
        await queryRunner.query(`DO $$ BEGIN
            CREATE TYPE "public"."user_role_enum" AS ENUM('freelancer', 'client', 'admin');
            EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;`);
        
        // Add new columns to user table
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" "public"."user_role_enum" NOT NULL DEFAULT 'freelancer'`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "skills" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "experience" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "hourlyRate" numeric`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "portfolio" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "location" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "languages" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "rating" numeric NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "completedProjects" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from user table
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "completedProjects"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "rating"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "languages"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "location"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "portfolio"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "hourlyRate"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "experience"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "skills"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "bio"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN IF EXISTS "role"`);
        
        // Drop enum type if exists
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
    }
} 