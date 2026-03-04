import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductEntityPageAndproductRelatedRemve1772637364459 implements MigrationInterface {
    name = 'ProductEntityPageAndproductRelatedRemve1772637364459'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_dbe08ff7e19ef2424ab0d27263e"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "REL_dbe08ff7e19ef2424ab0d27263"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "REL_dbe08ff7e19ef2424ab0d27263" UNIQUE ("landing_page_id")`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_dbe08ff7e19ef2424ab0d27263e" FOREIGN KEY ("landing_page_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
