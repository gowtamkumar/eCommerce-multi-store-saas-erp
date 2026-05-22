import { MigrationInterface, QueryRunner } from 'typeorm'

export class AccountingEnhancements1779365234567 implements MigrationInterface {
  name = 'AccountingEnhancements1779365234567'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Alter journal_entries table to add reversal columns
    await queryRunner.query(
      `ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "is_reversal" BOOLEAN NOT NULL DEFAULT FALSE`
    )
    await queryRunner.query(
      `ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "reversed_journal_entry_id" UUID NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "journal_entries" DROP CONSTRAINT IF EXISTS "FK_journal_entries_reversed"`
    )
    await queryRunner.query(
      `ALTER TABLE "journal_entries" 
       ADD CONSTRAINT "FK_journal_entries_reversed" 
       FOREIGN KEY ("reversed_journal_entry_id") REFERENCES "journal_entries"("id") ON DELETE SET NULL`
    )

    // 2. Create accounting_outbox table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "accounting_outbox" (
        "id"           UUID                     NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"    UUID                     NOT NULL,
        "event"        CHARACTER VARYING(100)  NOT NULL,
        "payload"      JSONB                    NOT NULL,
        "status"       CHARACTER VARYING(50)   NOT NULL DEFAULT 'PENDING',
        "attempts"     INTEGER                  NOT NULL DEFAULT 0,
        "error"        TEXT,
        "created_at"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "processed_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_accounting_outbox" PRIMARY KEY ("id"),
        CONSTRAINT "FK_accounting_outbox_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `)

    // 3. Create Indexes for outbox
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_accounting_outbox_status_created" ON "accounting_outbox"("status", "created_at")`
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_accounting_outbox_tenant_status" ON "accounting_outbox"("tenant_id", "status")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_accounting_outbox_tenant_status"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_accounting_outbox_status_created"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "accounting_outbox"`)
    await queryRunner.query(`ALTER TABLE "journal_entries" DROP CONSTRAINT IF EXISTS "FK_journal_entries_reversed"`)
    await queryRunner.query(`ALTER TABLE "journal_entries" DROP COLUMN IF EXISTS "reversed_journal_entry_id"`)
    await queryRunner.query(`ALTER TABLE "journal_entries" DROP COLUMN IF EXISTS "is_reversal"`)
  }
}
