import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTenantGlobalOnboardingFields1783200000001 implements MigrationInterface {
  name = 'AddTenantGlobalOnboardingFields1783200000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "accounting_standard" character varying(50) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "residency_region" character varying(50) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "db_host" character varying(255) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "db_name" character varying(100) NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "accounting_standard"`)
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "residency_region"`)
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "db_host"`)
    await queryRunner.query(`ALTER TABLE "tenants" DROP COLUMN IF EXISTS "db_name"`)
  }
}
