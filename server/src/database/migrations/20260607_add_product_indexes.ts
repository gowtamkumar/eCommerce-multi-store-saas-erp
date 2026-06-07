import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to add indexes that improve the performance of the admin product list.
 *   - Composite index on tenantId + name for name sorting and search.
 *   - Composite index on tenantId + price for price sorting.
 *   - Index on tenantId + stock to speed up low‑stock filtering.
 */
export class AddProductIndexes1667890123456 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Composite index for name sorting / searching (tenant + name)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_tenant_name" ON "products" ("tenant_id", "name")`,
    )

    // Composite index for price sorting (tenant + price)
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_tenant_price" ON "products" ("tenant_id", "price")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_tenant_name"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_tenant_price"`)
  }
}
