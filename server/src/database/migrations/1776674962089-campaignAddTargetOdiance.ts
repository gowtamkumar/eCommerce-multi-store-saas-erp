import { MigrationInterface, QueryRunner } from 'typeorm'

export class CampaignAddTargetOdiance1776674962089 implements MigrationInterface {
  name = 'CampaignAddTargetOdiance1776674962089'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "target_users" boolean NOT NULL DEFAULT true`,
    )
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "target_subscribers" boolean NOT NULL DEFAULT false`,
    )
    await queryRunner.query(
      `ALTER TABLE "campaigns" ADD "target_leads" boolean NOT NULL DEFAULT false`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "target_leads"`)
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "target_subscribers"`)
    await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "target_users"`)
  }
}
