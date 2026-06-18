import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCatalogSeoFields1781350000000 implements MigrationInterface {
  name = 'AddCatalogSeoFields1781350000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "meta_title" character varying(255)`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "meta_description" character varying(500)`,
    )
    await queryRunner.query(
      `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "meta_title" character varying(255)`,
    )
    await queryRunner.query(
      `ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "meta_description" character varying(500)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN IF EXISTS "meta_description"`)
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN IF EXISTS "meta_title"`)
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "meta_description"`)
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "meta_title"`)
  }
}
