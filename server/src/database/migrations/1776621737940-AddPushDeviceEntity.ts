import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPushDeviceEntity1776621737940 implements MigrationInterface {
    name = 'AddPushDeviceEntity1776621737940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "user_id" uuid, "tenant_id" uuid NOT NULL, "token" text NOT NULL, "platform" character varying(50) NOT NULL DEFAULT 'web', "user_agent" text, CONSTRAINT "PK_b1514758245c12daf43486dd1f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5e9bee993b4ce35c3606cda194" ON "devices" ("user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b97bc210a32b35c2d79d2ba53b" ON "devices" ("tenant_id", "token") `);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "devices" ADD CONSTRAINT "FK_17569dfbcf467d8959b04e3b6d4" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_17569dfbcf467d8959b04e3b6d4"`);
        await queryRunner.query(`ALTER TABLE "devices" DROP CONSTRAINT "FK_5e9bee993b4ce35c3606cda194c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b97bc210a32b35c2d79d2ba53b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5e9bee993b4ce35c3606cda194"`);
        await queryRunner.query(`DROP TABLE "devices"`);
    }

}
