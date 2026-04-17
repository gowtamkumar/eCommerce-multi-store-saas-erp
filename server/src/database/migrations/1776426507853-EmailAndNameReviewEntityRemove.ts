import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailAndNameReviewEntityRemove1776426507853 implements MigrationInterface {
    name = 'EmailAndNameReviewEntityRemove1776426507853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "customer_name"`);
        await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "customer_email"`);
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."inventory_transactions_reference_type_enum" RENAME TO "inventory_transactions_reference_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_transactions_reference_type_enum" AS ENUM('order', 'purchase', 'adjustment', 'initial', 'return')`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ALTER COLUMN "reference_type" TYPE "public"."inventory_transactions_reference_type_enum" USING "reference_type"::"text"::"public"."inventory_transactions_reference_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_transactions_reference_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf"`);
        await queryRunner.query(`CREATE TYPE "public"."inventory_transactions_reference_type_enum_old" AS ENUM('order', 'purchase', 'adjustment', 'initial')`);
        await queryRunner.query(`ALTER TABLE "inventory_transactions" ALTER COLUMN "reference_type" TYPE "public"."inventory_transactions_reference_type_enum_old" USING "reference_type"::"text"::"public"."inventory_transactions_reference_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."inventory_transactions_reference_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."inventory_transactions_reference_type_enum_old" RENAME TO "inventory_transactions_reference_type_enum"`);
        await queryRunner.query(`ALTER TABLE "reviews" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "customer_email" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD "customer_name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "reviews" ADD CONSTRAINT "FK_728447781a30bc3fcfe5c2f1cdf" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
