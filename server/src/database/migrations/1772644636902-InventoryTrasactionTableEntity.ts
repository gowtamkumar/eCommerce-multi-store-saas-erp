import { MigrationInterface, QueryRunner } from 'typeorm'

export class InventoryTrasactionTableEntity1772644636902 implements MigrationInterface {
  name = 'InventoryTrasactionTableEntity1772644636902'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_transactions_type_enum" AS ENUM('IN', 'OUT')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."inventory_transactions_reference_type_enum" AS ENUM('ORDER', 'PURCHASE', 'ADJUSTMENT')`,
    )
    await queryRunner.query(
      `CREATE TABLE "inventory_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product_id" uuid NOT NULL, "type" "public"."inventory_transactions_type_enum" NOT NULL, "quantity" integer NOT NULL, "reference_type" "public"."inventory_transactions_reference_type_enum" NOT NULL, "reference_id" character varying(255), "tenant_id" uuid NOT NULL, CONSTRAINT "PK_9b7144851f08f9eededde7edd42" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_2520d97de0c9a0fbfc9b00f4c1b" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" ADD CONSTRAINT "FK_d84016219a197827a82e178881c" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_d84016219a197827a82e178881c"`,
    )
    await queryRunner.query(
      `ALTER TABLE "inventory_transactions" DROP CONSTRAINT "FK_2520d97de0c9a0fbfc9b00f4c1b"`,
    )
    await queryRunner.query(`DROP TABLE "inventory_transactions"`)
    await queryRunner.query(`DROP TYPE "public"."inventory_transactions_reference_type_enum"`)
    await queryRunner.query(`DROP TYPE "public"."inventory_transactions_type_enum"`)
  }
}
