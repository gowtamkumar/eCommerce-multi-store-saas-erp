import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlatformSmtpConfig1781430000000 implements MigrationInterface {
  name = 'AddPlatformSmtpConfig1781430000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "smtp" jsonb`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "platform_settings" DROP COLUMN IF EXISTS "smtp"`)
  }
}
