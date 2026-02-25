import { MigrationInterface, QueryRunner } from "typeorm";

export class NewTableAuditLogCreate1772032017227 implements MigrationInterface {
    name = 'NewTableAuditLogCreate1772032017227'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "user_id" uuid, "action" character varying(100) NOT NULL, "entity" character varying(100) NOT NULL, "entity_id" character varying(255), "old_value" jsonb, "new_value" jsonb, "ip_address" character varying(45), "user_agent" text, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_200e5746777e616b84e6c7ad63" ON "audit_logs" ("tenant_id", "user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_4cc30fe1cdd5088a8e361f8af7" ON "audit_logs" ("tenant_id", "entity", "entity_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_898d14750b88319b89b1ab66cd" ON "audit_logs" ("tenant_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "tenant_traffic" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tenant_traffic" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "page_traffic" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "page_traffic" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "platform_settings" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "files" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "files" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_6f18d459490bb48923b1f40bdb7"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "platform_settings" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "page_traffic" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "page_traffic" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "tenant_traffic" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "tenant_traffic" DROP COLUMN "created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_898d14750b88319b89b1ab66cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4cc30fe1cdd5088a8e361f8af7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_200e5746777e616b84e6c7ad63"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }

}
