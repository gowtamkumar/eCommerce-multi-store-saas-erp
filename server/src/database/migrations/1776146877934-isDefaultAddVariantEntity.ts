import { MigrationInterface, QueryRunner } from "typeorm";

export class IsDefaultAddVariantEntity1776146877934 implements MigrationInterface {
    name = 'IsDefaultAddVariantEntity1776146877934'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "is_default" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "is_default"`);
    }

}
