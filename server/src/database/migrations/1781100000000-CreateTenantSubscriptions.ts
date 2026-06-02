import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTenantSubscriptions1781100000000 implements MigrationInterface {
  name = 'CreateTenantSubscriptions1781100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create tenant_subscriptions table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tenant_subscriptions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "subscription_plan_id" UUID NOT NULL REFERENCES "subscription_plans"("id") ON DELETE RESTRICT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'active',
        "billing_cycle" VARCHAR(50) NOT NULL DEFAULT 'monthly',
        "starts_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "ends_at" TIMESTAMPTZ,
        "stripe_subscription_id" VARCHAR(255),
        "stripe_customer_id" VARCHAR(255),
        "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ DEFAULT now(),
        "updated_at" TIMESTAMPTZ DEFAULT now()
      )
    `)

    // 2. Add active_subscription_id column to tenants if not exists
    await queryRunner.query(`
      ALTER TABLE "tenants"
      ADD COLUMN IF NOT EXISTS "active_subscription_id" UUID REFERENCES "tenant_subscriptions"("id") ON DELETE SET NULL
    `)

    // 3. Migrate existing active subscription records using a CTE (only if active_subscription_id is null and subscription_plan_id is present)
    // Check if the legacy subscription columns still exist before running data migration
    const hasLegacyColumns = await queryRunner.hasColumn('tenants', 'subscription_plan_id')
    if (hasLegacyColumns) {
      await queryRunner.query(`
        WITH inserted_subs AS (
          INSERT INTO "tenant_subscriptions" (
            "tenant_id", "subscription_plan_id", "status", "billing_cycle", "starts_at", "ends_at"
          )
          SELECT
            "id", "subscription_plan_id", LOWER("subscription_status"::text), LOWER("subscription_billing_cycle"::text), "subscription_starts_at", "subscription_ends_at"
          FROM "tenants"
          WHERE "subscription_plan_id" IS NOT NULL AND "active_subscription_id" IS NULL
          RETURNING "id", "tenant_id"
        )
        UPDATE "tenants"
        SET "active_subscription_id" = inserted_subs."id"
        FROM inserted_subs
        WHERE "tenants"."id" = inserted_subs."tenant_id"
      `)
    }

    // 4. Drop legacy columns from tenants
    await queryRunner.query(`
      ALTER TABLE "tenants"
      DROP COLUMN IF EXISTS "subscription_plan_id",
      DROP COLUMN IF EXISTS "subscription_status",
      DROP COLUMN IF EXISTS "subscription_billing_cycle",
      DROP COLUMN IF EXISTS "subscription_starts_at",
      DROP COLUMN IF EXISTS "subscription_ends_at"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Add columns back to tenants table
    await queryRunner.query(`
      ALTER TABLE "tenants"
      ADD COLUMN "subscription_plan_id" UUID REFERENCES "subscription_plans"("id") ON DELETE SET NULL,
      ADD COLUMN "subscription_status" VARCHAR(50) DEFAULT 'ACTIVE',
      ADD COLUMN "subscription_billing_cycle" VARCHAR(50) DEFAULT 'MONTHLY',
      ADD COLUMN "subscription_starts_at" TIMESTAMPTZ,
      ADD COLUMN "subscription_ends_at" TIMESTAMPTZ
    `)

    // 2. Restore subscription details from tenant_subscriptions
    await queryRunner.query(`
      UPDATE "tenants"
      SET
        "subscription_plan_id" = ts."subscription_plan_id",
        "subscription_status" = UPPER(ts."status"),
        "subscription_billing_cycle" = UPPER(ts."billing_cycle"),
        "subscription_starts_at" = ts."starts_at",
        "subscription_ends_at" = ts."ends_at"
      FROM "tenant_subscriptions" ts
      WHERE "tenants"."active_subscription_id" = ts."id"
    `)

    // 3. Drop active_subscription_id from tenants
    await queryRunner.query(`
      ALTER TABLE "tenants"
      DROP COLUMN IF EXISTS "active_subscription_id"
    `)

    // 4. Drop tenant_subscriptions table
    await queryRunner.query(`
      DROP TABLE "tenant_subscriptions"
    `)
  }
}
