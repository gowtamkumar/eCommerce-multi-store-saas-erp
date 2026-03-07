import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLowStockThresholdToProducts1772902342509 implements MigrationInterface {
    name = 'AddLowStockThresholdToProducts1772902342509'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_sections"`);
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_copyright"`);
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer_description"`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer" jsonb`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "low_stock_threshold" integer NOT NULL DEFAULT '5'`);
        await queryRunner.query(`ALTER TABLE "products" ADD "low_stock_threshold" integer NOT NULL DEFAULT '5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "low_stock_threshold"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "low_stock_threshold"`);
        await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN "footer"`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_description" character varying`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_copyright" character varying`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD "footer_sections" jsonb`);
    }

}
