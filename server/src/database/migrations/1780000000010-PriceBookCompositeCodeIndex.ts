import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Replaces the global unique constraint on `price_books.code` with a
 * per-tenant composite unique constraint `(code, tenant_id)`.
 *
 * This allows different merchant tenants to reuse the same short codes
 * (e.g. "RETAIL", "WHOLESALE") without conflicting with each other.
 */
export class PriceBookCompositeCodeIndex1780000000010 implements MigrationInterface {
  name = 'PriceBookCompositeCodeIndex1780000000010'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop the old global unique index/constraint on code
    //    TypeORM generates the name as UQ_<hash> for @Column({ unique: true })
    //    We use IF EXISTS to be safe across environments.
    await queryRunner.query(`
      ALTER TABLE "price_books"
      DROP CONSTRAINT IF EXISTS "UQ_price_books_code"
    `)

    // Also try the TypeORM-generated name pattern (hash-based)
    await queryRunner.query(`
      DO $$
      DECLARE
        constraint_name TEXT;
      BEGIN
        SELECT conname INTO constraint_name
        FROM pg_constraint
        WHERE conrelid = 'price_books'::regclass
          AND contype = 'u'
          AND array_length(conkey, 1) = 1
          AND conkey[1] = (
            SELECT attnum FROM pg_attribute
            WHERE attrelid = 'price_books'::regclass AND attname = 'code'
          );

        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE price_books DROP CONSTRAINT %I', constraint_name);
        END IF;
      END;
      $$;
    `)

    // 2. Create the new composite unique constraint (code + tenant_id)
    await queryRunner.query(`
      ALTER TABLE "price_books"
      ADD CONSTRAINT "UQ_price_books_code_tenant"
      UNIQUE ("code", "tenant_id")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop the composite constraint
    await queryRunner.query(`
      ALTER TABLE "price_books"
      DROP CONSTRAINT IF EXISTS "UQ_price_books_code_tenant"
    `)

    // 2. Restore the old global unique constraint on code
    await queryRunner.query(`
      ALTER TABLE "price_books"
      ADD CONSTRAINT "UQ_price_books_code"
      UNIQUE ("code")
    `)
  }
}
