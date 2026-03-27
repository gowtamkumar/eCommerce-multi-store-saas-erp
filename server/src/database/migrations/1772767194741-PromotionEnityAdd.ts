import { MigrationInterface, QueryRunner } from 'typeorm'

export class PromotionEnityAdd1772767194741 implements MigrationInterface {
  name = 'PromotionEnityAdd1772767194741'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_promotiontype_enum" AS ENUM('percentage', 'fixed_amount', 'free_shipping', 'bogo')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."promotions_targettype_enum" AS ENUM('entire_order', 'specific_product', 'specific_category', 'specific_brand', 'minimum_cart_value')`,
    )
    await queryRunner.query(
      `CREATE TABLE "promotions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "description" text, "promotionType" "public"."promotions_promotiontype_enum" NOT NULL DEFAULT 'percentage', "value" numeric(10,2), "targetType" "public"."promotions_targettype_enum" NOT NULL DEFAULT 'entire_order', "target_id" uuid, "min_order_value" numeric(10,2), "start_date" TIMESTAMP, "end_date" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, "tenant_id" uuid NOT NULL, CONSTRAINT "PK_380cecbbe3ac11f0e5a7c452c34" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "promotions" ADD CONSTRAINT "FK_f8bcbc3a412f82f76f493769a98" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "promotions" DROP CONSTRAINT "FK_f8bcbc3a412f82f76f493769a98"`,
    )
    await queryRunner.query(`DROP TABLE "promotions"`)
    await queryRunner.query(`DROP TYPE "public"."promotions_targettype_enum"`)
    await queryRunner.query(`DROP TYPE "public"."promotions_promotiontype_enum"`)
  }
}
