import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugPromostionEntity1772905698024 implements MigrationInterface {
    name = 'AddSlugPromostionEntity1772905698024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_sections"`);
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_copyright"`);
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_description"`);
        await queryRunner.query(`ALTER TABLE "promotions" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "promotions" ADD CONSTRAINT "UQ_dbea049b681d15564f46dd7bdee" UNIQUE ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "promotions" DROP CONSTRAINT "UQ_dbea049b681d15564f46dd7bdee"`);
        await queryRunner.query(`ALTER TABLE "promotions" DROP COLUMN "slug"`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_description" character varying`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_copyright" character varying`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_sections" jsonb`);
    }

}
