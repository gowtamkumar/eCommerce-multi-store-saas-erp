import { MigrationInterface, QueryRunner } from 'typeorm'

export class FileEntityTenantIdNullableFalse1772470778831 implements MigrationInterface {
  name = 'FileEntityTenantIdNullableFalse1772470778831'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "tenant_id" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" ALTER COLUMN "tenant_id" DROP NOT NULL`)
  }
}
