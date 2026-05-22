import { MigrationInterface, QueryRunner } from 'typeorm'

export class CrmDunningAndLoyaltyRules1779365234569 implements MigrationInterface {
  name = 'CrmDunningAndLoyaltyRules1779365234569'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create dunning_rules table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dunning_rules" (
        "id"            UUID                     NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"     UUID                     NOT NULL,
        "dunning_level" INT                      NOT NULL,
        "days_overdue"  INT                      NOT NULL,
        "action"        CHARACTER VARYING(50)    NOT NULL,
        "email_subject" CHARACTER VARYING(255)   NOT NULL,
        "email_body"    TEXT                     NOT NULL,
        "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at"    TIMESTAMP WITH TIME ZONE NULL,
        CONSTRAINT "PK_dunning_rules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dunning_rules_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `)

    // 2. Create dunning_logs table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "dunning_logs" (
        "id"                        UUID                     NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"                 UUID                     NOT NULL,
        "customer_id"               UUID                     NOT NULL,
        "dunning_rule_id"           UUID                     NOT NULL,
        "action_taken"              CHARACTER VARYING(50)    NOT NULL,
        "recipient_email"           CHARACTER VARYING(255)   NOT NULL,
        "email_subject"             CHARACTER VARYING(255)   NULL,
        "email_body"                TEXT                     NULL,
        "triggered_days_overdue"    INT                      NOT NULL,
        "triggered_amount_overdue"  DECIMAL(12,2)            NOT NULL,
        "created_at"                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dunning_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dunning_logs_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_dunning_logs_customer" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_dunning_logs_rule" FOREIGN KEY ("dunning_rule_id") REFERENCES "dunning_rules"("id") ON DELETE CASCADE
      )
    `)

    // 3. Create loyalty_rules table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "loyalty_rules" (
        "id"          UUID                     NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"   UUID                     NOT NULL,
        "name"        CHARACTER VARYING(255)   NOT NULL,
        "type"        CHARACTER VARYING(50)    NOT NULL,
        "value"       DECIMAL(10,2)            NOT NULL,
        "conditions"  JSONB                    NULL DEFAULT '{}',
        "is_active"   BOOLEAN                  NOT NULL DEFAULT true,
        "start_date"  TIMESTAMP WITH TIME ZONE NULL,
        "end_date"    TIMESTAMP WITH TIME ZONE NULL,
        "created_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMP WITH TIME ZONE NULL,
        CONSTRAINT "PK_loyalty_rules" PRIMARY KEY ("id"),
        CONSTRAINT "FK_loyalty_rules_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE
      )
    `)

    // Indexes for dunning and loyalty rules
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_dunning_rules_tenant" ON "dunning_rules"("tenant_id")`
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_dunning_logs_tenant_customer" ON "dunning_logs"("tenant_id", "customer_id")`
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_loyalty_rules_tenant" ON "loyalty_rules"("tenant_id")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_loyalty_rules_tenant"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_dunning_logs_tenant_customer"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_dunning_rules_tenant"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "loyalty_rules"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "dunning_logs"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "dunning_rules"`)
  }
}
