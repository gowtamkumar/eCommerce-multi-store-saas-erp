import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * System Settings hardening:
 *
 *   1. Custom domain ownership token:
 *      - `custom_domain_verification_token` column on `tenants`
 *        (used by the TXT verification flow at /tenants/custom-domain/verify)
 *
 *   2. Label settings persistence:
 *      - `label_settings` JSONB column on `site_settings`
 *        (was previously stored only in the React form state)
 *
 *   3. Store identity/localisation foundations:
 *      - favicon, timezone, locale, theme, default_branch_id, branding
 *
 * Idempotent: every column add is gated behind IF NOT EXISTS so reruns are
 * safe after a partial `synchronize: true` pass.
 */
export class SystemSettingsHardening1780700000000 implements MigrationInterface {
  name = 'SystemSettingsHardening1780700000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants"
       ADD COLUMN IF NOT EXISTS "custom_domain_verification_token" varchar(64)`,
    )

    await queryRunner.query(
      `ALTER TABLE "site_settings"
       ADD COLUMN IF NOT EXISTS "label_settings" jsonb,
       ADD COLUMN IF NOT EXISTS "favicon" varchar,
       ADD COLUMN IF NOT EXISTS "timezone" varchar(64),
       ADD COLUMN IF NOT EXISTS "locale" varchar(20),
       ADD COLUMN IF NOT EXISTS "theme" jsonb,
       ADD COLUMN IF NOT EXISTS "default_branch_id" uuid,
       ADD COLUMN IF NOT EXISTS "branding" jsonb`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings"
       DROP COLUMN IF EXISTS "branding",
       DROP COLUMN IF EXISTS "default_branch_id",
       DROP COLUMN IF EXISTS "theme",
       DROP COLUMN IF EXISTS "locale",
       DROP COLUMN IF EXISTS "timezone",
       DROP COLUMN IF EXISTS "favicon",
       DROP COLUMN IF EXISTS "label_settings"`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN IF EXISTS "custom_domain_verification_token"`,
    )
  }
}
