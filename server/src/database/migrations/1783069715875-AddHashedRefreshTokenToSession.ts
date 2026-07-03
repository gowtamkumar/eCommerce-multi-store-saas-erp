import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHashedRefreshTokenToSession1783069715875 implements MigrationInterface {
    name = 'AddHashedRefreshTokenToSession1783069715875'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" ADD "hashed_refresh_token" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT '1.1'`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT '1.25'`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT '1.5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT 1.5`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT 1.25`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT 1.1`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "hashed_refresh_token"`);
    }

}
