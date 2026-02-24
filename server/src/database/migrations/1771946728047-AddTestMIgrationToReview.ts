import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTestMIgrationToReview1771946728047 implements MigrationInterface {
    name = 'AddTestMIgrationToReview1771946728047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" ADD "test_migration" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "test_migration"`);
    }

}
