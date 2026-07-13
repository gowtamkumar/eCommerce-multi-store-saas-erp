import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueIndexToProductEmbeddings1783662771285 implements MigrationInterface {
    name = 'AddUniqueIndexToProductEmbeddings1783662771285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT '1.1'`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT '1.25'`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT '1.5'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1028c63fd1e9311d78e768d278" ON "product_embeddings"  ("store_id", "product_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1028c63fd1e9311d78e768d278"`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "platinum_multiplier" SET DEFAULT 1.5`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "gold_multiplier" SET DEFAULT 1.25`);
        await queryRunner.query(`ALTER TABLE "loyalty_configs" ALTER COLUMN "silver_multiplier" SET DEFAULT 1.1`);
    }

}
