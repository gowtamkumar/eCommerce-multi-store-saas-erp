import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddMultiCurrencyToLedger1782000000000 implements MigrationInterface {
  name = 'AddMultiCurrencyToLedger1782000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "currency" character varying(3) DEFAULT 'USD'`,
    )
    await queryRunner.query(
      `ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "exchange_rate" numeric(15,6) DEFAULT 1.0`,
    )
    await queryRunner.query(
      `ALTER TABLE "ledger_entries" ADD COLUMN IF NOT EXISTS "transaction_currency" character varying(3) DEFAULT 'USD'`,
    )
    await queryRunner.query(
      `ALTER TABLE "ledger_entries" ADD COLUMN IF NOT EXISTS "transaction_amount" numeric(15,2) DEFAULT 0`,
    )
    await queryRunner.query(
      `ALTER TABLE "ledger_entries" ADD COLUMN IF NOT EXISTS "exchange_rate" numeric(15,6) DEFAULT 1.0`,
    )
    
    // Seed default values for existing ledger_entries (make transaction_amount = amount)
    await queryRunner.query(
      `UPDATE "ledger_entries" SET "transaction_amount" = "amount" WHERE "transaction_amount" = 0 OR "transaction_amount" IS NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "journal_entries" DROP COLUMN IF EXISTS "currency"`)
    await queryRunner.query(`ALTER TABLE "journal_entries" DROP COLUMN IF EXISTS "exchange_rate"`)
    await queryRunner.query(`ALTER TABLE "ledger_entries" DROP COLUMN IF EXISTS "transaction_currency"`)
    await queryRunner.query(`ALTER TABLE "ledger_entries" DROP COLUMN IF EXISTS "transaction_amount"`)
    await queryRunner.query(`ALTER TABLE "ledger_entries" DROP COLUMN IF EXISTS "exchange_rate"`)
  }
}
