import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreatePlatformCampaigns1781450000000 implements MigrationInterface {
  name = 'CreatePlatformCampaigns1781450000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create platform_campaigns
    await queryRunner.query(
      `CREATE TABLE "platform_campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" uuid,
        "name" character varying(255) NOT NULL,
        "type" character varying(50) NOT NULL DEFAULT 'email',
        "status" character varying(50) NOT NULL DEFAULT 'draft',
        "schedule_time" TIMESTAMP WITH TIME ZONE,
        "total_audience" integer NOT NULL DEFAULT 0,
        "sent_count" integer NOT NULL DEFAULT 0,
        "failed_count" integer NOT NULL DEFAULT 0,
        "target_tenants" boolean NOT NULL DEFAULT false,
        "target_subscribers" boolean NOT NULL DEFAULT false,
        "target_users" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_platform_campaigns" PRIMARY KEY ("id")
      )`
    )

    await queryRunner.query(
      `CREATE INDEX "IDX_platform_campaigns_user" ON "platform_campaigns" ("user_id")`
    )

    // Create platform_campaign_messages
    await queryRunner.query(
      `CREATE TABLE "platform_campaign_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" uuid,
        "platform_campaign_id" uuid NOT NULL,
        "subject" character varying(255),
        "html_content" text,
        "text" text,
        "title" character varying(255),
        "body" text,
        "image_url" character varying(500),
        CONSTRAINT "PK_platform_campaign_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_platform_campaign_messages_campaign" FOREIGN KEY ("platform_campaign_id") REFERENCES "platform_campaigns"("id") ON DELETE CASCADE
      )`
    )

    await queryRunner.query(
      `CREATE INDEX "IDX_platform_campaign_messages_campaign" ON "platform_campaign_messages" ("platform_campaign_id")`
    )

    // Create platform_campaign_logs
    await queryRunner.query(
      `CREATE TABLE "platform_campaign_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "user_id" uuid,
        "platform_campaign_id" uuid NOT NULL,
        "recipient_key" character varying(255) NOT NULL,
        "status" character varying(50) NOT NULL DEFAULT 'pending',
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "opened_at" TIMESTAMP WITH TIME ZONE,
        "clicked_at" TIMESTAMP WITH TIME ZONE,
        "error" text,
        "recipient_name" character varying(255),
        "recipient_email" character varying(255),
        "recipient_phone" character varying(255),
        CONSTRAINT "PK_platform_campaign_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_platform_campaign_logs_campaign" FOREIGN KEY ("platform_campaign_id") REFERENCES "platform_campaigns"("id") ON DELETE CASCADE
      )`
    )

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_platform_campaign_logs_campaign_recipient" ON "platform_campaign_logs" ("platform_campaign_id", "recipient_key")`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."UQ_platform_campaign_logs_campaign_recipient"`)
    await queryRunner.query(`DROP TABLE "platform_campaign_logs"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_platform_campaign_messages_campaign"`)
    await queryRunner.query(`DROP TABLE "platform_campaign_messages"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_platform_campaign_campaign"`)
    await queryRunner.query(`DROP TABLE "platform_campaigns"`)
  }
}
