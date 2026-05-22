import { MigrationInterface, QueryRunner } from 'typeorm'

export class PosEnhancements1779365234568 implements MigrationInterface {
  name = 'PosEnhancements1779365234568'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Alter orders table to add offline_sale_id and payments columns
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "offline_sale_id" UUID NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payments" JSONB NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "UQ_orders_offline_sale_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_orders_offline_sale_id" UNIQUE ("offline_sale_id")`
    )

    // 2. Alter pos_shifts table to add cash_in and cash_out columns
    await queryRunner.query(
      `ALTER TABLE "pos_shifts" ADD COLUMN IF NOT EXISTS "cash_in" DECIMAL(12,2) NOT NULL DEFAULT 0`
    )
    await queryRunner.query(
      `ALTER TABLE "pos_shifts" ADD COLUMN IF NOT EXISTS "cash_out" DECIMAL(12,2) NOT NULL DEFAULT 0`
    )

    // 3. Create pos_drawer_transactions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pos_drawer_transactions" (
        "id"          UUID                     NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"   UUID                     NOT NULL,
        "shift_id"    UUID                     NOT NULL,
        "type"        CHARACTER VARYING(50)   NOT NULL,
        "amount"      DECIMAL(12,2)            NOT NULL,
        "reason"      TEXT,
        "user_id"     UUID                     NULL,
        "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMP WITH TIME ZONE NULL,
        CONSTRAINT "PK_pos_drawer_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pos_drawer_transactions_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pos_drawer_transactions_shift" FOREIGN KEY ("shift_id") REFERENCES "pos_shifts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pos_drawer_transactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `)

    // 4. Create index on tenant_id + shift_id for speed
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pos_drawer_transactions_tenant_shift" ON "pos_drawer_transactions"("tenant_id", "shift_id")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pos_drawer_transactions_tenant_shift"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "pos_drawer_transactions"`)
    await queryRunner.query(`ALTER TABLE "pos_shifts" DROP COLUMN IF EXISTS "cash_out"`)
    await queryRunner.query(`ALTER TABLE "pos_shifts" DROP COLUMN IF EXISTS "cash_in"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "UQ_orders_offline_sale_id"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "payments"`)
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "offline_sale_id"`)
  }
}
