import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Migration to add indexes that improve the performance of the admin product list.
 *   - Composite index on tenantId + name for name sorting and search.
 *   - Composite index on tenantId + price for price sorting.
 *
 * NOTE: The timestamp suffix below MUST stay greater than the InitialBaseline
 * migration so TypeORM runs this AFTER the `products` table exists.
 */
export class AddProductIndexes1781200000000 implements MigrationInterface {
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
