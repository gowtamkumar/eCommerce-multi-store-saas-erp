import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlatformSmsConfig1781440000000 implements MigrationInterface {
  name = 'AddPlatformSmsConfig1781440000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "sms" jsonb`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "platform_settings" DROP COLUMN IF EXISTS "sms"`)
  }
}
