import { MigrationInterface, QueryRunner } from 'typeorm'

export class FinanceEnhancementsAtoZ1783400001000 implements MigrationInterface {
  name = 'FinanceEnhancementsAtoZ1783400001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add multi-attachment JSONB column to expenses (backward compatible — nullable with empty array default)
    await queryRunner.query(`
      ALTER TABLE "expenses"
      ADD COLUMN IF NOT EXISTS "attachments" jsonb NOT NULL DEFAULT '[]'
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "expenses"
      DROP COLUMN IF EXISTS "attachments"
    `)
  }
}
