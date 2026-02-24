import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoverenamemigrationFromReviewEntity1771950196266 implements MigrationInterface {
    name = 'RemoverenamemigrationFromReviewEntity1771950196266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "renamemigration"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ADD "renamemigration" character varying NOT NULL`);
    }

}
