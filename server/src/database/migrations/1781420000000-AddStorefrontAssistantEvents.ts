import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStorefrontAssistantEvents1781420000000 implements MigrationInterface {
  name = 'AddStorefrontAssistantEvents1781420000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "storefront_assistant_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id" uuid NOT NULL,
        "type" character varying(32) NOT NULL,
        "live_chat_handoff" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_storefront_assistant_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_storefront_assistant_events_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `)

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_storefront_assistant_events_tenant_created" ON "storefront_assistant_events" ("tenant_id", "created_at")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "storefront_assistant_events"`)
  }
}
