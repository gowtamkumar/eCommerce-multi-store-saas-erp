import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddVariantLogisticsFields1783200000000 implements MigrationInterface {
  name = 'AddVariantLogisticsFields1783200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "weight" numeric(10,3) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "height" numeric(10,2) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "width" numeric(10,2) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "length" numeric(10,2) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "country_of_origin" character varying(100) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "hs_code" character varying(50) NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "weight"`)
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "height"`)
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "width"`)
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "length"`)
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "country_of_origin"`)
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "hs_code"`)
  }
}
