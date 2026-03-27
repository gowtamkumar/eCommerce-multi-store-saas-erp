import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLowStockThresholdToProducts1772902281409 implements MigrationInterface {
  name = 'AddLowStockThresholdToProducts1772902281409'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "low_stock_threshold" integer NOT NULL DEFAULT '5'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "low_stock_threshold"`)
  }
}
