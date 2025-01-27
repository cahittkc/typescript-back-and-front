import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFields1711384000000 implements MigrationInterface {
    name = 'AddUserProfileFields1711384000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for user roles
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('freelancer', 'client', 'admin')`);
        
        // Add new columns to user table
        await queryRunner.query(`ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'freelancer'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bio" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "skills" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "experience" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "hourlyRate" numeric`);
        await queryRunner.query(`ALTER TABLE "user" ADD "portfolio" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "location" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "languages" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "rating" numeric NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "completedProjects" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from user table
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "completedProjects"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "languages"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "location"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "portfolio"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "hourlyRate"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "experience"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "skills"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        
        // Drop enum type
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }
} 