import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Adds:
 *   1. Two new values to inventory_ledger.reference_type enum:
 *      - BATCH_INTAKE (for product-batch initial intake)
 *      - BATCH_EXPIRY_WRITEOFF (for auto write-off when a batch expires)
 *   2. Variant-aware composite index on inventory_ledger.
 *
 * Idempotent: works even when synchronize:true has already created some of these.
 */
export class InventoryLedgerEnumAndIndexFixes1780500000000 implements MigrationInterface {
  name = 'InventoryLedgerEnumAndIndexFixes1780500000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add enum values if missing.
    const enumName = 'inventory_ledger_reference_type_enum'
    const enumValues: string[] = (
      await queryRunner.query(
        `SELECT enumlabel FROM pg_enum
         WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1)`,
        [enumName],
      )
    ).map((r: any) => r.enumlabel)

    if (enumValues.length > 0) {
      if (!enumValues.includes('BATCH_INTAKE')) {
        await queryRunner.query(
          `ALTER TYPE "public"."${enumName}" ADD VALUE IF NOT EXISTS 'BATCH_INTAKE'`,
        )
      }
      if (!enumValues.includes('BATCH_EXPIRY_WRITEOFF')) {
        await queryRunner.query(
          `ALTER TYPE "public"."${enumName}" ADD VALUE IF NOT EXISTS 'BATCH_EXPIRY_WRITEOFF'`,
        )
      }
    }

    // 2. Variant-aware composite index on inventory_ledger.
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_inv_ledger_tenant_prod_variant_wh_created"
       ON "inventory_ledger" ("tenant_id", "product_id", "variant_id", "warehouse_id", "created_at")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new index — enum values cannot be removed safely in Postgres.
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_inv_ledger_tenant_prod_variant_wh_created"`)
  }
}
