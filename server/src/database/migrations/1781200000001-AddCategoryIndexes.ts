import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Additional indexes to improve the admin categories page performance.
 *   - Composite index on products (tenant_id, category_id) for the product count sub-query.
 *   - Composite index on categories (tenant_id, name) for sorting and lookup.
 *
 * NOTE: The timestamp suffix below MUST stay greater than the InitialBaseline
 * migration so TypeORM runs this AFTER the `products`/`categories` tables exist.
 */
export class AddCategoryIndexes1781200000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_product_tenant_category" ON "products" ("tenant_id", "category_id")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_category_tenant_name" ON "categories" ("tenant_id", "name")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_tenant_category"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_category_tenant_name"`)
  }
}
