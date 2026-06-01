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
       ADD COLUMN IF NOT EXISTS "label_settings" jsonb`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "label_settings"`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" DROP COLUMN IF EXISTS "custom_domain_verification_token"`,
    )
  }
}
