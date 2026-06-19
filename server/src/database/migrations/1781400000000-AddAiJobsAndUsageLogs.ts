import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAiJobsAndUsageLogs1781400000000 implements MigrationInterface {
  name = 'AddAiJobsAndUsageLogs1781400000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "type" character varying(64) NOT NULL,
        "status" character varying(32) NOT NULL DEFAULT 'pending',
        "payload" jsonb,
        "result" jsonb,
        "error" text,
        "total_tokens" integer NOT NULL DEFAULT 0,
        "bull_job_id" character varying(128),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "started_at" TIMESTAMPTZ,
        "completed_at" TIMESTAMPTZ,
        CONSTRAINT "PK_ai_jobs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ai_jobs_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ai_jobs_tenant_status" ON "ai_jobs" ("tenant_id", "status")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ai_jobs_tenant_created" ON "ai_jobs" ("tenant_id", "created_at")`,
    )

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "endpoint" character varying(128) NOT NULL,
        "operation" character varying(32) NOT NULL,
        "model" character varying(128) NOT NULL,
        "prompt_tokens" integer NOT NULL DEFAULT 0,
        "completion_tokens" integer NOT NULL DEFAULT 0,
        "total_tokens" integer NOT NULL DEFAULT 0,
        "job_id" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_usage_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ai_usage_logs_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ai_usage_logs_job" FOREIGN KEY ("job_id") REFERENCES "ai_jobs"("id") ON DELETE SET NULL
      )
    `)

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_ai_usage_logs_tenant_created" ON "ai_usage_logs" ("tenant_id", "created_at")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_usage_logs"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_jobs"`)
  }
}
