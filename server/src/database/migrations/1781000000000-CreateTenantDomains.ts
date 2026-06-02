import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTenantDomains1781000000000 implements MigrationInterface {
  name = 'CreateTenantDomains1781000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create tenant_domains table
    await queryRunner.query(`
      CREATE TABLE "tenant_domains" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "hostname" VARCHAR(253) NOT NULL UNIQUE,
        "is_primary" BOOLEAN DEFAULT false,
        "status" VARCHAR(20) DEFAULT 'pending',
        "verification_token" VARCHAR(64),
        "verified_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ DEFAULT now(),
        "updated_at" TIMESTAMPTZ DEFAULT now()
      )
    `)

    // 2. Create index on hostname
    await queryRunner.query(`
      CREATE INDEX "idx_tenant_domains_hostname" ON "tenant_domains"("hostname")
    `)

    // 3. Migrate existing active custom domains
    await queryRunner.query(`
      INSERT INTO "tenant_domains" (
        "tenant_id", "hostname", "is_primary", "status", "verification_token", "verified_at"
      )
      SELECT 
        "id", "custom_domain", true, LOWER("custom_domain_status"::text), "custom_domain_verification_token", "custom_domain_verified_at"
      FROM "tenants"
      WHERE "custom_domain" IS NOT NULL
    `)

    // 4. Drop columns from tenants table
    await queryRunner.query(`
      ALTER TABLE "tenants" 
      DROP COLUMN IF EXISTS "custom_domain",
      DROP COLUMN IF EXISTS "custom_domain_status",
      DROP COLUMN IF EXISTS "custom_domain_verified_at",
      DROP COLUMN IF EXISTS "custom_domain_verification_token"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Add columns back to tenants table
    await queryRunner.query(`
      ALTER TABLE "tenants"
      ADD COLUMN "custom_domain" VARCHAR(253) UNIQUE,
      ADD COLUMN "custom_domain_status" VARCHAR(50) DEFAULT 'pending',
      ADD COLUMN "custom_domain_verified_at" TIMESTAMPTZ,
      ADD COLUMN "custom_domain_verification_token" VARCHAR(64)
    `)

    // 2. Populate tenants table back with primary custom domains
    await queryRunner.query(`
      UPDATE "tenants"
      SET 
        "custom_domain" = td."hostname",
        "custom_domain_status" = UPPER(td."status"),
        "custom_domain_verified_at" = td."verified_at",
        "custom_domain_verification_token" = td."verification_token"
      FROM "tenant_domains" td
      WHERE "tenants"."id" = td."tenant_id" AND td."is_primary" = true
    `)

    // 3. Drop tenant_domains table
    await queryRunner.query(`
      DROP TABLE "tenant_domains"
    `)
  }
}
