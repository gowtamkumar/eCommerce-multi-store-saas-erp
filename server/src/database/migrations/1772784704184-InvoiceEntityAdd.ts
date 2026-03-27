import { MigrationInterface, QueryRunner } from 'typeorm'

export class InvoiceEntityAdd1772784704184 implements MigrationInterface {
  name = 'InvoiceEntityAdd1772784704184'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invoices_status_enum" AS ENUM('PENDING', 'PAID', 'OVERDUE', 'CANCELLED')`,
    )
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "invoice_number" character varying(100) NOT NULL, "order_id" uuid NOT NULL, "issue_date" date NOT NULL, "due_date" date, "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'PENDING', "tenant_id" uuid NOT NULL, CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_ea83c3b911906a3578de2340fdf" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_440f531f452dcc4389d201b9d4b" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_440f531f452dcc4389d201b9d4b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP CONSTRAINT "FK_ea83c3b911906a3578de2340fdf"`,
    )
    await queryRunner.query(`DROP TABLE "invoices"`)
    await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`)
  }
}
