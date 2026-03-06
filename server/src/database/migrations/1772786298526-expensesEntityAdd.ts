import { MigrationInterface, QueryRunner } from "typeorm";

export class ExpensesEntityAdd1772786298526 implements MigrationInterface {
    name = 'ExpensesEntityAdd1772786298526'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."expenses_category_enum" AS ENUM('SHIPPING', 'PACKAGING', 'MARKETING', 'SOFTWARE', 'SALARIES', 'UTILITIES', 'MAINTENANCE', 'OTHER')`);
        await queryRunner.query(`CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(255) NOT NULL, "description" text, "amount" numeric(10,2) NOT NULL, "expense_date" date NOT NULL, "category" "public"."expenses_category_enum" NOT NULL DEFAULT 'OTHER', "reference_number" character varying(100), "tenant_id" uuid NOT NULL, CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_e86e6bebe054a040132d2aeb5bc" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_e86e6bebe054a040132d2aeb5bc"`);
        await queryRunner.query(`DROP TABLE "expenses"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_category_enum"`);
    }

}
