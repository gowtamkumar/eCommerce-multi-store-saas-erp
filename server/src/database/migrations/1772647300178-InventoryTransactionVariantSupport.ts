import { MigrationInterface, QueryRunner } from "typeorm";

export class InventoryTransactionVariantSupport1772647300178 implements MigrationInterface {
    name = 'InventoryTransactionVariantSupport1772647300178'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD "variant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_aeb0f3a59ed2fd95e1a13097eda" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_aeb0f3a59ed2fd95e1a13097eda"`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP COLUMN "variant_id"`);
    }

}
