import { MigrationInterface, QueryRunner } from 'typeorm'

export class FileEntityTenantIdNullableTrue1772470436531 implements MigrationInterface {
  name = 'FileEntityTenantIdNullableTrue1772470436531'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" ADD "tenant_id" uuid`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "tenant_id"`)
  }
}
