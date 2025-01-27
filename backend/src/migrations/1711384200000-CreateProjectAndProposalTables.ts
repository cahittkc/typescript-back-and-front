import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProjectAndProposalTables1711384200000 implements MigrationInterface {
    name = 'CreateProjectAndProposalTables1711384200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create project status enum
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."project_status_enum" AS ENUM('open', 'in_progress', 'completed', 'cancelled');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        `);

        // Create project category enum
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."project_category_enum" AS ENUM(
                    'web_development', 'mobile_development', 'ui_ux_design', 
                    'graphic_design', 'content_writing', 'digital_marketing',
                    'seo', 'data_science', 'blockchain', 'other'
                );
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        `);

        // Create proposal status enum
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."proposal_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'withdrawn');
            EXCEPTION WHEN duplicate_object THEN NULL;
            END $$;
        `);

        // Create project table
        await queryRunner.query(`
            CREATE TABLE "project" (
                "id" SERIAL NOT NULL,
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "status" "public"."project_status_enum" NOT NULL DEFAULT 'open',
                "category" "public"."project_category_enum" NOT NULL,
                "budget" decimal(10,2) NOT NULL,
                "deadline" TIMESTAMP NOT NULL,
                "requiredSkills" text,
                "attachments" character varying,
                "isCompleted" boolean NOT NULL DEFAULT false,
                "completedAt" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "clientId" integer NOT NULL,
                "assignedFreelancerId" integer,
                CONSTRAINT "PK_project" PRIMARY KEY ("id")
            )
        `);

        // Create proposal table
        await queryRunner.query(`
            CREATE TABLE "proposal" (
                "id" SERIAL NOT NULL,
                "bidAmount" decimal(10,2) NOT NULL,
                "deliveryTime" integer NOT NULL,
                "coverLetter" text NOT NULL,
                "status" "public"."proposal_status_enum" NOT NULL DEFAULT 'pending',
                "attachments" text,
                "clientNote" character varying,
                "isAccepted" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "projectId" integer NOT NULL,
                "freelancerId" integer NOT NULL,
                CONSTRAINT "PK_proposal" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "project" 
            ADD CONSTRAINT "FK_project_client" 
            FOREIGN KEY ("clientId") 
            REFERENCES "user"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "project" 
            ADD CONSTRAINT "FK_project_freelancer" 
            FOREIGN KEY ("assignedFreelancerId") 
            REFERENCES "user"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "proposal" 
            ADD CONSTRAINT "FK_proposal_project" 
            FOREIGN KEY ("projectId") 
            REFERENCES "project"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "proposal" 
            ADD CONSTRAINT "FK_proposal_freelancer" 
            FOREIGN KEY ("freelancerId") 
            REFERENCES "user"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "proposal" DROP CONSTRAINT "FK_proposal_freelancer"`);
        await queryRunner.query(`ALTER TABLE "proposal" DROP CONSTRAINT "FK_proposal_project"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_project_freelancer"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_project_client"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "proposal"`);
        await queryRunner.query(`DROP TABLE "project"`);

        // Drop enums
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."proposal_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."project_category_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."project_status_enum"`);
    }
} 