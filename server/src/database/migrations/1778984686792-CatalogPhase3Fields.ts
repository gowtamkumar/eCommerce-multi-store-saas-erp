import { MigrationInterface, QueryRunner } from 'typeorm'

export class CatalogPhase3Fields1778984686792 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Categories: Tree support ---
    await queryRunner.query(
      `ALTER TABLE "categories" ADD IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`,
    )
    await queryRunner.query(
      `ALTER TABLE "categories" ADD IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0`,
    )
    await queryRunner.query(`ALTER TABLE "categories" ADD IF NOT EXISTS "parent_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "fk_category_parent" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_categories_tenant_parent" ON "categories" ("tenant_id", "parent_id")`,
    )

    // --- Brands: isActive ---
    await queryRunner.query(
      `ALTER TABLE "brands" ADD IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`,
    )

    // --- Products: sku, barcode, productType ---
    await queryRunner.query(`ALTER TABLE "products" ADD IF NOT EXISTS "sku" character varying(100)`)
    await queryRunner.query(
      `ALTER TABLE "products" ADD IF NOT EXISTS "barcode" character varying(100)`,
    )
    await queryRunner.query(`DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'products_product_type_enum') THEN
                CREATE TYPE "products_product_type_enum" AS ENUM('SIMPLE', 'VARIABLE', 'BUNDLE', 'SERVICE');
            END IF;
        END $$`)
    await queryRunner.query(
      `ALTER TABLE "products" ADD IF NOT EXISTS "product_type" "products_product_type_enum" NOT NULL DEFAULT 'SIMPLE'`,
    )

    // --- Variants: barcode ---
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD IF NOT EXISTS "barcode" character varying(100)`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_variants" DROP COLUMN IF EXISTS "barcode"`)
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "product_type"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "products_product_type_enum"`)
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "barcode"`)
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "sku"`)
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN IF EXISTS "is_active"`)
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "fk_category_parent"`,
    )
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "parent_id"`)
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "sort_order"`)
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "is_active"`)
  }
}
