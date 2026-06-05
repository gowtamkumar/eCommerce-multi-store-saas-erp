import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddReturnMethodFields1780025197772 implements MigrationInterface {
  name = 'AddReturnMethodFields1780025197772'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT '1.1'`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT '1.25'`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT '1.5'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT 1.5`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT 1.25`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT 1.1`,
    )
  }
}
