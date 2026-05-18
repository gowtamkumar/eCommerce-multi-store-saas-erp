import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddFulfillmentTasksTable1779365123456 implements MigrationInterface {
  name = 'AddFulfillmentTasksTable1779365123456'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fulfillment_tasks_status_enum') THEN
          CREATE TYPE "public"."fulfillment_tasks_status_enum" AS ENUM('PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');
        END IF;
      END
      $$;
    `)

    const tableExists = await queryRunner.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fulfillment_tasks')`,
    )

    if (!tableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "fulfillment_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "order_id" uuid NOT NULL, "status" "public"."fulfillment_tasks_status_enum" NOT NULL DEFAULT 'PENDING', "warehouse_id" uuid, "assigned_to_user_id" uuid, "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "tenant_id" uuid NOT NULL, "user_id" uuid, CONSTRAINT "PK_7f8c5bbf2f04b3e4ab2f0d1e5c2" PRIMARY KEY ("id"))`,
      )

      await queryRunner.query(
        `CREATE INDEX "IDX_fulfillment_tasks_tenant_status" ON "fulfillment_tasks" ("tenant_id", "status")`,
      )

      await queryRunner.query(
        `ALTER TABLE "fulfillment_tasks" ADD CONSTRAINT "FK_fulfillment_tasks_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      )

      await queryRunner.query(
        `ALTER TABLE "fulfillment_tasks" ADD CONSTRAINT "FK_fulfillment_tasks_warehouse_id" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      )

      await queryRunner.query(
        `ALTER TABLE "fulfillment_tasks" ADD CONSTRAINT "FK_fulfillment_tasks_assigned_to" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      )

      await queryRunner.query(
        `ALTER TABLE "fulfillment_tasks" ADD CONSTRAINT "FK_fulfillment_tasks_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      )

      await queryRunner.query(
        `ALTER TABLE "fulfillment_tasks" ADD CONSTRAINT "FK_fulfillment_tasks_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fulfillment_tasks" DROP CONSTRAINT "FK_fulfillment_tasks_user"`,
    )

    await queryRunner.query(
      `ALTER TABLE "fulfillment_tasks" DROP CONSTRAINT "FK_fulfillment_tasks_tenant"`,
    )

    await queryRunner.query(
      `ALTER TABLE "fulfillment_tasks" DROP CONSTRAINT "FK_fulfillment_tasks_assigned_to"`,
    )

    await queryRunner.query(
      `ALTER TABLE "fulfillment_tasks" DROP CONSTRAINT "FK_fulfillment_tasks_warehouse_id"`,
    )

    await queryRunner.query(
      `ALTER TABLE "fulfillment_tasks" DROP CONSTRAINT "FK_fulfillment_tasks_order_id"`,
    )

    await queryRunner.query(`DROP INDEX "public"."IDX_fulfillment_tasks_tenant_status"`)

    await queryRunner.query(`DROP TABLE "fulfillment_tasks"`)

    await queryRunner.query(`DROP TYPE "public"."fulfillment_tasks_status_enum"`)
  }
}
