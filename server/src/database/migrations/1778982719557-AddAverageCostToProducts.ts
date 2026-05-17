import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAverageCostToProducts1778982719557 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "average_cost" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "product_variants" ADD "average_cost" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN "average_cost"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "average_cost"`);
    }

}
