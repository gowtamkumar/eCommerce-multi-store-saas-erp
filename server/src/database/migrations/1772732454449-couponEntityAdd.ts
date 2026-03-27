import { MigrationInterface, QueryRunner } from 'typeorm'

export class CouponEntityAdd1772732454449 implements MigrationInterface {
  name = 'CouponEntityAdd1772732454449'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."coupons_discounttype_enum" AS ENUM('percentage', 'fixed')`,
    )
    await queryRunner.query(
      `CREATE TABLE "coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying(50) NOT NULL, "description" character varying(255), "discountType" "public"."coupons_discounttype_enum" NOT NULL DEFAULT 'percentage', "amount" numeric(10,2) NOT NULL, "min_purchase_amount" numeric(10,2) NOT NULL DEFAULT '0', "start_date" TIMESTAMP, "expiry_date" TIMESTAMP, "usage_limit" integer, "used_count" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "tenant_id" uuid NOT NULL, CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(`ALTER TABLE "orders" ADD "applied_coupon" character varying(50)`)
    await queryRunner.query(
      `ALTER TABLE "orders" ADD "coupon_discount_amount" numeric(10,2) NOT NULL DEFAULT '0'`,
    )
    await queryRunner.query(`ALTER TABLE "carts" ADD "applied_coupon_code" character varying(50)`)
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD CONSTRAINT "FK_169338eead44e81c390fbc64626" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP CONSTRAINT "FK_169338eead44e81c390fbc64626"`,
    )
    await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "applied_coupon_code"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "coupon_discount_amount"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "applied_coupon"`)
    await queryRunner.query(`DROP TABLE "coupons"`)
    await queryRunner.query(`DROP TYPE "public"."coupons_discounttype_enum"`)
  }
}
