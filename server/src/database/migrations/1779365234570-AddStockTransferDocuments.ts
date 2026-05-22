import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStockTransferDocuments1779365234570 implements MigrationInterface {
  name = 'AddStockTransferDocuments1779365234570'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create StockTransferStatus ENUM
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_transfers_status_enum') THEN
          CREATE TYPE "public"."stock_transfers_status_enum" AS ENUM('DRAFT', 'APPROVED', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED');
        END IF;
      END
      $$;
    `)

    // 2. Create stock_transfers table
    const transferTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_transfers')`,
    )
    if (!transferTableExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "stock_transfers" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP WITH TIME ZONE,
          "transfer_number" character varying(100) NOT NULL,
          "source_warehouse_id" uuid NOT NULL,
          "destination_warehouse_id" uuid NOT NULL,
          "status" "public"."stock_transfers_status_enum" NOT NULL DEFAULT 'DRAFT',
          "remarks" text,
          "tenant_id" uuid NOT NULL,
          "user_id" uuid,
          CONSTRAINT "PK_stock_transfers_id" PRIMARY KEY ("id")
        )
      `)

      // Add indexes for stock_transfers
      await queryRunner.query(`CREATE INDEX "IDX_stock_transfers_tenant_created" ON "stock_transfers" ("tenant_id", "created_at")`)
      await queryRunner.query(`CREATE INDEX "IDX_stock_transfers_tenant_status" ON "stock_transfers" ("tenant_id", "status")`)
      await queryRunner.query(`CREATE INDEX "IDX_stock_transfers_number" ON "stock_transfers" ("transfer_number")`)

      // Add foreign keys for stock_transfers
      await queryRunner.query(`
        ALTER TABLE "stock_transfers" 
        ADD CONSTRAINT "FK_stock_transfers_source_warehouse" 
        FOREIGN KEY ("source_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_transfers" 
        ADD CONSTRAINT "FK_stock_transfers_destination_warehouse" 
        FOREIGN KEY ("destination_warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_transfers" 
        ADD CONSTRAINT "FK_stock_transfers_tenant" 
        FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_transfers" 
        ADD CONSTRAINT "FK_stock_transfers_user" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      `)
    }

    // 3. Create stock_transfer_items table
    const itemsTableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'stock_transfer_items')`,
    )
    if (!itemsTableExists[0].exists) {
      await queryRunner.query(`
        CREATE TABLE "stock_transfer_items" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deleted_at" TIMESTAMP WITH TIME ZONE,
          "transfer_id" uuid NOT NULL,
          "product_id" uuid NOT NULL,
          "variant_id" uuid,
          "quantity_requested" numeric(12,2) NOT NULL,
          "quantity_received" numeric(12,2) NOT NULL DEFAULT 0.00,
          "user_id" uuid,
          CONSTRAINT "PK_stock_transfer_items_id" PRIMARY KEY ("id")
        )
      `)

      // Add indexes for stock_transfer_items
      await queryRunner.query(`CREATE INDEX "IDX_stock_transfer_items_transfer" ON "stock_transfer_items" ("transfer_id")`)
      await queryRunner.query(`CREATE INDEX "IDX_stock_transfer_items_product" ON "stock_transfer_items" ("product_id")`)
      await queryRunner.query(`CREATE INDEX "IDX_stock_transfer_items_variant" ON "stock_transfer_items" ("variant_id")`)

      // Add foreign keys for stock_transfer_items
      await queryRunner.query(`
        ALTER TABLE "stock_transfer_items" 
        ADD CONSTRAINT "FK_stock_transfer_items_transfer" 
        FOREIGN KEY ("transfer_id") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_transfer_items" 
        ADD CONSTRAINT "FK_stock_transfer_items_product" 
        FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      `)
      await queryRunner.query(`
        ALTER TABLE "stock_transfer_items" 
        ADD CONSTRAINT "FK_stock_transfer_items_variant" 
        FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop constraints and tables
    await queryRunner.query(`ALTER TABLE "stock_transfer_items" DROP CONSTRAINT IF EXISTS "FK_stock_transfer_items_variant"`)
    await queryRunner.query(`ALTER TABLE "stock_transfer_items" DROP CONSTRAINT IF EXISTS "FK_stock_transfer_items_product"`)
    await queryRunner.query(`ALTER TABLE "stock_transfer_items" DROP CONSTRAINT IF EXISTS "FK_stock_transfer_items_transfer"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_transfer_items"`)

    await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT IF EXISTS "FK_stock_transfers_user"`)
    await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT IF EXISTS "FK_stock_transfers_tenant"`)
    await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT IF EXISTS "FK_stock_transfers_destination_warehouse"`)
    await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT IF EXISTS "FK_stock_transfers_source_warehouse"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "stock_transfers"`)

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."stock_transfers_status_enum"`)
  }
}
