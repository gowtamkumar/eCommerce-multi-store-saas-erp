import { MigrationInterface, QueryRunner } from "typeorm";

export class SubscriptionPlanEntityUpdate1774875292928 implements MigrationInterface {
    name = 'SubscriptionPlanEntityUpdate1774875292928'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "monthly_price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "yearly_price" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "is_popular" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "is_popular"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "yearly_price"`);
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "monthly_price"`);
    }

}
