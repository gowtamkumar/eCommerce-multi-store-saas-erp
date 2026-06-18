import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenantAiConfig1781310000000 implements MigrationInterface {
  name = 'AddTenantAiConfig1781310000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "ai_config" jsonb`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "ai_config"`)
  }
}
