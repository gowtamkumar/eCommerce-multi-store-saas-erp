import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStoreMetaTitle1781360000000 implements MigrationInterface {
  name = 'AddStoreMetaTitle1781360000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "meta_title" character varying(255)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "meta_title"`)
  }
}
