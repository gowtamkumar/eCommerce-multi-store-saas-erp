import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStripeAndPaypalToPaymentMethod1783000000000 implements MigrationInterface {
  name = 'AddStripeAndPaypalToPaymentMethod1783000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."payments_method_enum" ADD VALUE IF NOT EXISTS 'stripe'`)
    await queryRunner.query(`ALTER TYPE "public"."payments_method_enum" ADD VALUE IF NOT EXISTS 'paypal'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL does not support removing values from an ENUM type easily.
    // In down, we do nothing as the added values do not cause issues and can be ignored.
  }
}
