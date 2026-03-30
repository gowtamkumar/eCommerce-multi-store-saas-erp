import { MigrationInterface, QueryRunner } from "typeorm";

export class TrialStatusEnumUpdate1774881224101 implements MigrationInterface {
    name = 'TrialStatusEnumUpdate1774881224101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscription_invoices_billing_cycle_enum" AS ENUM('monthly', 'yearly')`);
        await queryRunner.query(`ALTER TABLE "subscription_invoices" ADD "billing_cycle" "public"."subscription_invoices_billing_cycle_enum" NOT NULL DEFAULT 'monthly'`);
        await queryRunner.query(`ALTER TYPE "public"."tenants_subscription_status_enum" RENAME TO "tenants_subscription_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tenants_subscription_status_enum" AS ENUM('trial', 'active', 'past_due', 'canceled', 'expired')`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" TYPE "public"."tenants_subscription_status_enum" USING "subscription_status"::"text"::"public"."tenants_subscription_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."tenants_subscription_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tenants_subscription_status_enum_old" AS ENUM('active', 'past_due', 'canceled', 'expired')`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" TYPE "public"."tenants_subscription_status_enum_old" USING "subscription_status"::"text"::"public"."tenants_subscription_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tenants" ALTER COLUMN "subscription_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."tenants_subscription_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tenants_subscription_status_enum_old" RENAME TO "tenants_subscription_status_enum"`);
        await queryRunner.query(`ALTER TABLE "subscription_invoices" DROP COLUMN "billing_cycle"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_invoices_billing_cycle_enum"`);
    }

}
