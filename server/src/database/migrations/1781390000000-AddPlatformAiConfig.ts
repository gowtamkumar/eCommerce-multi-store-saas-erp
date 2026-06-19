import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlatformAiConfig1781390000000 implements MigrationInterface {
  name = 'AddPlatformAiConfig1781390000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "ai_config" jsonb`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "platform_settings" DROP COLUMN IF EXISTS "ai_config"`)
  }
}
