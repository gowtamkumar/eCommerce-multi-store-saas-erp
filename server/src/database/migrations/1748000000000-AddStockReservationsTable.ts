import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStockReservationsTable1748000000000 implements MigrationInterface {
  name = 'AddStockReservationsTable1748000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create the status enum (idempotent)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_reservations_status_enum') THEN
          CREATE TYPE "public"."stock_reservations_status_enum"
            AS ENUM('ACTIVE', 'FULFILLED', 'RELEASED', 'EXPIRED');
        END IF;
      END
      $$;
    `)

    // 2. Create the table (idempotent)
    const tableExists = await queryRunner.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'stock_reservations'
       )`,
    )

    if (!tableExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "stock_reservations" (
          "id"            uuid          NOT NULL DEFAULT uuid_generate_v4(),
          "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
          "updated_at"    TIMESTAMPTZ   NOT NULL DEFAULT now(),
          "deleted_at"    TIMESTAMPTZ,
          "user_id"       uuid,
          "product_id"    uuid          NOT NULL,
          "variant_id"    uuid,
          "warehouse_id"  uuid,
          "order_id"      uuid,
          "reserved_qty"  DECIMAL(12,2) NOT NULL,
          "fulfilled_qty" DECIMAL(12,2) NOT NULL DEFAULT 0,
          "released_qty"  DECIMAL(12,2) NOT NULL DEFAULT 0,
          "status"        "public"."stock_reservations_status_enum" NOT NULL DEFAULT 'ACTIVE',
          "expires_at"    TIMESTAMPTZ,
          "reserved_at"   TIMESTAMPTZ   NOT NULL DEFAULT now(),
          "released_at"   TIMESTAMPTZ,
          "notes"         TEXT,
          "tenant_id"     uuid          NOT NULL,
          CONSTRAINT "PK_stock_reservations" PRIMARY KEY ("id")
        )
      `)

      // Indexes
      await queryRunner.query(
        `CREATE INDEX "IDX_stock_res_tenant_status"
           ON "stock_reservations" ("tenant_id", "status")`,
      )
      await queryRunner.query(
        `CREATE INDEX "IDX_stock_res_product_tenant_status"
           ON "stock_reservations" ("product_id", "variant_id", "tenant_id", "status")`,
      )
      await queryRunner.query(
        `CREATE INDEX "IDX_stock_res_expires_at"
           ON "stock_reservations" ("expires_at")
           WHERE "expires_at" IS NOT NULL`,
      )
      await queryRunner.query(
        `CREATE INDEX "IDX_stock_res_order_id"
           ON "stock_reservations" ("order_id")`,
      )

      // Unique: one reservation per (tenant, order, product, variant)
      await queryRunner.query(`
        ALTER TABLE "stock_reservations"
          ADD CONSTRAINT "UQ_stock_res_order_product_variant"
          UNIQUE ("tenant_id", "order_id", "product_id", "variant_id")
      `)

      // Foreign keys
      await queryRunner.query(`
        ALTER TABLE "stock_reservations"
          ADD CONSTRAINT "FK_stock_res_product"
          FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_reservations"
          ADD CONSTRAINT "FK_stock_res_variant"
          FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_reservations"
          ADD CONSTRAINT "FK_stock_res_warehouse"
          FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_reservations"
          ADD CONSTRAINT "FK_stock_res_order"
          FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_reservations"
          ADD CONSTRAINT "FK_stock_res_tenant"
          FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_reservations"
          ADD CONSTRAINT "FK_stock_res_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stock_reservations" DROP CONSTRAINT IF EXISTS "FK_stock_res_user"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_reservations" DROP CONSTRAINT IF EXISTS "FK_stock_res_tenant"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_reservations" DROP CONSTRAINT IF EXISTS "FK_stock_res_order"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_reservations" DROP CONSTRAINT IF EXISTS "FK_stock_res_warehouse"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_reservations" DROP CONSTRAINT IF EXISTS "FK_stock_res_variant"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_reservations" DROP CONSTRAINT IF EXISTS "FK_stock_res_product"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stock_reservations" DROP CONSTRAINT IF EXISTS "UQ_stock_res_order_product_variant"`,
    )
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_stock_res_order_id"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_stock_res_expires_at"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_stock_res_product_tenant_status"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_stock_res_tenant_status"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_reservations"`)
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."stock_reservations_status_enum"`)
  }
}
