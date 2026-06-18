import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLoyaltyProgramCopy1781370000000 implements MigrationInterface {
  name = 'AddLoyaltyProgramCopy1781370000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ADD COLUMN IF NOT EXISTS "program_description" text`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" ADD COLUMN IF NOT EXISTS "referral_message" character varying(500)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" DROP COLUMN IF EXISTS "referral_message"`,
    )
    await queryRunner.query(
      `ALTER TABLE "loyalty_configs" DROP COLUMN IF EXISTS "program_description"`,
    )
  }
}
