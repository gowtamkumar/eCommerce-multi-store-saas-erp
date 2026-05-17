import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWholesalePricingToProducts1778983562817 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "wholesale_price" numeric(10,2) DEFAULT '0'`,
    )
    await queryRunner.query(`ALTER TABLE "products" ADD "min_wholesale_qty" integer DEFAULT '1'`)
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD "wholesale_price" numeric(10,2) DEFAULT '0'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "wholesale_price"`)
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "min_wholesale_qty"`)
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "wholesale_price"`)
  }
}
