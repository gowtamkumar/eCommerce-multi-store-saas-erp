import { MigrationInterface, QueryRunner } from 'typeorm'

export class SettingEntityFooterAllfiledMarge1772898996046 implements MigrationInterface {
  name = 'SettingEntityFooterAllfiledMarge1772898996046'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_sections"`)
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_description"`)
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_copyright"`)
    await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer" jsonb`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer"`)
    await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_copyright" character varying`)
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD "footer_description" character varying`,
    )
    await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_sections" jsonb`)
  }
}
