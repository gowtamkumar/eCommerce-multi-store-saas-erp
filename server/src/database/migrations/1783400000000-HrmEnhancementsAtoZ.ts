import { MigrationInterface, QueryRunner } from 'typeorm'

export class HrmEnhancementsAtoZ1783400000000 implements MigrationInterface {
  name = 'HrmEnhancementsAtoZ1783400000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "latitude" numeric(10, 7) NULL')
    await queryRunner.query('ALTER TABLE "branches" ADD COLUMN IF NOT EXISTS "longitude" numeric(10, 7) NULL')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "branches" DROP COLUMN IF EXISTS "longitude"')
    await queryRunner.query('ALTER TABLE "branches" DROP COLUMN IF EXISTS "latitude"')
  }
}
