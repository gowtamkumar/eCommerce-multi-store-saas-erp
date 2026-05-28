import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Drop the feature_definitions table since FeatureDefinitionEntity is deleted.
 */
export class DropFeatureDefinitionsTable1780000000002 implements MigrationInterface {
  name = 'DropFeatureDefinitionsTable1780000000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "feature_definitions" CASCADE`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "feature_definitions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "display_name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "plan_tier" VARCHAR(50) DEFAULT 'starter',
        "is_core" BOOLEAN DEFAULT false,
        "is_active" BOOLEAN DEFAULT true,
        "created_at" TIMESTAMPTZ DEFAULT now(),
        "updated_at" TIMESTAMPTZ DEFAULT now()
      )
    `)
  }
}
