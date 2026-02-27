import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditLogTableCreate1772167025359 implements MigrationInterface {
    name = 'AuditLogTableCreate1772167025359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tenant_traffic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "date" date NOT NULL, "request_count" integer NOT NULL DEFAULT '0', "last_updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a95e4df16abc74c950152d7fff7" UNIQUE ("tenant_id", "date"), CONSTRAINT "PK_964cb6b12e433147b9525500a12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "page_traffic" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tenant_id" uuid NOT NULL, "path" character varying NOT NULL, "date" date NOT NULL, "request_count" integer NOT NULL DEFAULT '0', "last_updated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9102a514cadd00797b5be929a25" UNIQUE ("tenant_id", "path", "date"), CONSTRAINT "PK_d4c976e72a5a0bcb9e29182821f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "page_traffic"`);
        await queryRunner.query(`DROP TABLE "tenant_traffic"`);
    }

}
