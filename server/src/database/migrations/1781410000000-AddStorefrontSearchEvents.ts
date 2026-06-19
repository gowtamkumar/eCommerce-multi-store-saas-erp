import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStorefrontSearchEvents1781410000000 implements MigrationInterface {
  name = 'AddStorefrontSearchEvents1781410000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "storefront_search_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "mode" character varying(16) NOT NULL,
        "result_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_storefront_search_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_storefront_search_events_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_storefront_search_events_tenant_created" ON "storefront_search_events" ("tenant_id", "created_at")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "storefront_search_events"`)
  }
}
