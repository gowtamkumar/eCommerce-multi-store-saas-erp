import { MigrationInterface, QueryRunner } from 'typeorm'

export class HrmEnhancements1780100000000 implements MigrationInterface {
  name = 'HrmEnhancements1780100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Holidays table
    const holidaysExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'holidays')`,
    )
    if (!holidaysExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "holidays" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMPTZ,
          "user_id" uuid,
          "tenant_id" uuid NOT NULL,
          "branch_id" uuid,
          "date" date NOT NULL,
          "name" varchar NOT NULL,
          "year" int NOT NULL,
          "is_optional" boolean NOT NULL DEFAULT false,
          "description" text,
          CONSTRAINT "PK_holidays_id" PRIMARY KEY ("id")
        )
      `)
      await queryRunner.query(`CREATE INDEX "IDX_holidays_tenant_year" ON "holidays" ("tenant_id", "year")`)
      await queryRunner.query(`CREATE INDEX "IDX_holidays_tenant_date" ON "holidays" ("tenant_id", "date")`)
    } else {
      const hasBranchId = await queryRunner.hasColumn('holidays', 'branch_id')
      if (!hasBranchId) {
        await queryRunner.query(`ALTER TABLE "holidays" ADD COLUMN "branch_id" uuid`)
      }
    }

    // 2. Tax brackets table
    const taxBracketsExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hrm_tax_brackets')`,
    )
    if (!taxBracketsExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "hrm_tax_brackets" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMPTZ,
          "user_id" uuid,
          "tenant_id" uuid NOT NULL,
          "fiscal_year" int NOT NULL,
          "min_amount" numeric(14,2) NOT NULL,
          "max_amount" numeric(14,2),
          "rate" numeric(6,4) NOT NULL,
          "flat_tax" numeric(14,2) NOT NULL DEFAULT 0,
          "sort_order" int NOT NULL DEFAULT 0,
          CONSTRAINT "PK_hrm_tax_brackets_id" PRIMARY KEY ("id")
        )
      `)
      await queryRunner.query(
        `CREATE INDEX "IDX_hrm_tax_brackets_tenant_year" ON "hrm_tax_brackets" ("tenant_id", "fiscal_year")`,
      )
    }

    // 3. Employee ID sequence table
    const seqExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hrm_employee_id_sequences')`,
    )
    if (!seqExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "hrm_employee_id_sequences" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMPTZ,
          "user_id" uuid,
          "tenant_id" uuid NOT NULL,
          "prefix" varchar NOT NULL DEFAULT 'EMP-',
          "pad_length" int NOT NULL DEFAULT 6,
          "last_value" bigint NOT NULL DEFAULT 0,
          CONSTRAINT "PK_hrm_employee_id_sequences_id" PRIMARY KEY ("id"),
          CONSTRAINT "UQ_hrm_employee_id_sequences_tenant" UNIQUE ("tenant_id")
        )
      `)
      await queryRunner.query(
        `CREATE INDEX "IDX_hrm_employee_id_sequences_tenant" ON "hrm_employee_id_sequences" ("tenant_id")`,
      )
    }

    // 4. Shift working_days column
    const hasWorkingDays = await queryRunner.hasColumn('shifts', 'working_days')
    if (!hasWorkingDays) {
      await queryRunner.query(
        `ALTER TABLE "shifts" ADD COLUMN "working_days" int[] NOT NULL DEFAULT '{1,2,3,4,5}'`,
      )
    }

    // 5. Payroll batch status enum — add PENDING_APPROVAL + approval/paid timestamps
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_batches_status_enum') THEN
          CREATE TYPE "public"."payroll_batches_status_enum" AS ENUM(
            'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PAID', 'CANCELLED'
          );
        ELSE
          ALTER TYPE "public"."payroll_batches_status_enum" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
        END IF;
      END
      $$;
    `)

    const hasApprovedBy = await queryRunner.hasColumn('payroll_batches', 'approved_by_id')
    if (!hasApprovedBy) {
      await queryRunner.query(`ALTER TABLE "payroll_batches" ADD COLUMN "approved_by_id" uuid`)
      await queryRunner.query(`ALTER TABLE "payroll_batches" ADD COLUMN "approved_at" TIMESTAMPTZ`)
      await queryRunner.query(`ALTER TABLE "payroll_batches" ADD COLUMN "paid_at" TIMESTAMPTZ`)
    }

    const hasPeriodIndex = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_payroll_batches_tenant_period')`,
    )
    if (!hasPeriodIndex[0].exists) {
      await queryRunner.query(
        `CREATE INDEX "IDX_payroll_batches_tenant_period" ON "payroll_batches" ("tenant_id", "period")`,
      )
    }

    // 6. Applicant enum values (safe idempotent adds)
    const applicantStatuses = [
      'APPLIED', 'SCREENING', 'INTERVIEW', 'TECHNICAL',
      'HR_ROUND', 'OFFER', 'JOINED', 'REJECTED',
    ]
    for (const status of applicantStatuses) {
      try {
        await queryRunner.query(
          `ALTER TYPE applicants_status_enum ADD VALUE IF NOT EXISTS '${status}'`,
        )
      } catch {
        // enum type may not exist yet — synchronize will create it
      }
    }

    // 7. Employee schema fixes (moved from runtime fixDatabaseSchema)
    const hasEmpId = await queryRunner.hasColumn('employees', 'employee_id')
    if (!hasEmpId) {
      await queryRunner.query(
        `ALTER TABLE "employees" ADD COLUMN "employee_id" VARCHAR(255) UNIQUE`,
      )
    }

    const hasDesignation = await queryRunner.hasColumn('employees', 'designation_id')
    if (hasDesignation) {
      await queryRunner.query(
        `ALTER TABLE "employees" ALTER COLUMN "designation_id" DROP NOT NULL`,
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "hrm_employee_id_sequences"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "hrm_tax_brackets"`)
    await queryRunner.query(`ALTER TABLE "payroll_batches" DROP COLUMN IF EXISTS "paid_at"`)
    await queryRunner.query(`ALTER TABLE "payroll_batches" DROP COLUMN IF EXISTS "approved_at"`)
    await queryRunner.query(`ALTER TABLE "payroll_batches" DROP COLUMN IF EXISTS "approved_by_id"`)
    await queryRunner.query(`ALTER TABLE "shifts" DROP COLUMN IF EXISTS "working_days"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "holidays"`)
  }
}
