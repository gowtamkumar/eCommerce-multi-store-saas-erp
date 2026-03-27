import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixedSpelling1771949516993 implements MigrationInterface {
  name = 'FixedSpelling1771949516993'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" RENAME COLUMN "test_migration" TO "renamemigration"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" RENAME COLUMN "renamemigration" TO "test_migration"`,
    )
  }
}
