import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoPurchaseIntegration1772649259020 implements MigrationInterface {
    name = 'AutoPurchaseIntegration1772649259020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "supplier_id" uuid`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD "variant_id" uuid`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD "supplier_id" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."inventory_transactions_reference_type_enum" RENAME TO "inventory_transactions_reference_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_transactions_reference_type_enum" AS ENUM('ORDER', 'PURCHASE', 'ADJUSTMENT', 'INITIAL')`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ALTER COLUMN "reference_type" TYPE "public"."inventory_transactions_reference_type_enum" USING "reference_type"::"text"::"public"."inventory_transactions_reference_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_transactions_reference_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_0ec433c1e1d444962d592d86c86" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_c7a528a540ba57bfc7bac43109b" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_dde701f3b756ac6ad4040ecb551" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_dde701f3b756ac6ad4040ecb551"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_c7a528a540ba57bfc7bac43109b"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_0ec433c1e1d444962d592d86c86"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_transactions_reference_type_enum_old" AS ENUM('ORDER', 'PURCHASE', 'ADJUSTMENT')`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ALTER COLUMN "reference_type" TYPE "public"."inventory_transactions_reference_type_enum_old" USING "reference_type"::"text"::"public"."inventory_transactions_reference_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_transactions_reference_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."inventory_transactions_reference_type_enum_old" RENAME TO "inventory_transactions_reference_type_enum"`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" DROP COLUMN "supplier_id"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP COLUMN "variant_id"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "supplier_id"`);
    }

}
