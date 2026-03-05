import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEnityType1772727662347 implements MigrationInterface {
    name = 'UpdateEnityType1772727662347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "supplier_payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "purchase_order_id" uuid NOT NULL, "supplier_id" uuid NOT NULL, "amount" numeric(10,2) NOT NULL, "payment_date" TIMESTAMP NOT NULL DEFAULT now(), "payment_method" character varying(50) NOT NULL, "transaction_id" character varying(255), "note" text, "tenant_id" uuid NOT NULL, CONSTRAINT "PK_76e86f3194494faf999c652dbf9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_orders_payment_status_enum" AS ENUM('PENDING', 'PARTIAL', 'PAID')`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD "payment_status" "public"."purchase_orders_payment_status_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD "paid_amount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "supplier_payments" ADD CONSTRAINT "FK_5e3f9443818b705f6ab86b44764" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_payments" ADD CONSTRAINT "FK_220694212ec38b4aa2fb02ed622" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "supplier_payments" ADD CONSTRAINT "FK_b1c9c7f6f733b3a8a3501b0cb80" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier_payments" DROP CONSTRAINT "FK_b1c9c7f6f733b3a8a3501b0cb80"`);
        await queryRunner.query(`ALTER TABLE "supplier_payments" DROP CONSTRAINT "FK_220694212ec38b4aa2fb02ed622"`);
        await queryRunner.query(`ALTER TABLE "supplier_payments" DROP CONSTRAINT "FK_5e3f9443818b705f6ab86b44764"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP COLUMN "paid_amount"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP COLUMN "payment_status"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_orders_payment_status_enum"`);
        await queryRunner.query(`DROP TABLE "supplier_payments"`);
    }

}
