import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVariantIdToPurchaseRequisitionItems1784467006616 implements MigrationInterface {
    name = 'AddVariantIdToPurchaseRequisitionItems1784467006616'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_requisition_items" ADD "variant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT '1.1'`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT '1.25'`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT '1.5'`);
        await queryRunner.query(`ALTER TABLE "purchase_requisition_items" ADD CONSTRAINT "FK_5ea00c176fd91cd9bc1de711172" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_requisition_items" DROP CONSTRAINT "FK_5ea00c176fd91cd9bc1de711172"`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT 1.5`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT 1.25`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT 1.1`);
        await queryRunner.query(`ALTER TABLE "purchase_requisition_items" DROP COLUMN "variant_id"`);
    }

}
