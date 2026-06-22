import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddGlobalAddressFieldsToShippingAddresses1783100000000 implements MigrationInterface {
  name = 'AddGlobalAddressFieldsToShippingAddresses1783100000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shipping_addresses" ADD COLUMN IF NOT EXISTS "country" character varying(100) DEFAULT 'BD'`,
    )
    await queryRunner.query(
      `ALTER TABLE "shipping_addresses" ADD COLUMN IF NOT EXISTS "state" character varying(100) NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "shipping_addresses" ADD COLUMN IF NOT EXISTS "postal_code" character varying(20) NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shipping_addresses" DROP COLUMN IF EXISTS "country"`)
    await queryRunner.query(`ALTER TABLE "shipping_addresses" DROP COLUMN IF EXISTS "state"`)
    await queryRunner.query(`ALTER TABLE "shipping_addresses" DROP COLUMN IF EXISTS "postal_code"`)
  }
}
