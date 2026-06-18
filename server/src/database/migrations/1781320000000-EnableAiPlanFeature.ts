import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnableAiPlanFeature1781320000000 implements MigrationInterface {
  name = 'EnableAiPlanFeature1781320000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "features" = "features" || '["ai"]'::jsonb
      WHERE NOT ("features" @> '["ai"]'::jsonb)
    `)

    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "code", "name", "description", "module", "feature", "action", "risk_level")
      SELECT uuid_generate_v4(), 'ai:use', 'Use AI Tools',
        'Can use AI assistant, product copy, and campaign generation',
        'AI', 'ai', 'use', 'low'
      WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "code" = 'ai:use')
    `)

    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "code", "name", "description", "module", "feature", "action", "risk_level")
      SELECT uuid_generate_v4(), 'ai:manage', 'Manage AI Configuration',
        'Can configure AI provider settings and API keys',
        'AI', 'ai', 'manage', 'medium'
      WHERE NOT EXISTS (SELECT 1 FROM "permissions" WHERE "code" = 'ai:manage')
    `)

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r."is_system_role" = true
        AND p."code" IN ('ai:use', 'ai:manage')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp
          WHERE rp."role_id" = r.id AND rp."permission_id" = p.id
        )
    `)

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT DISTINCT r.id, p.id
      FROM "roles" r
      INNER JOIN "role_permissions" rp ON rp."role_id" = r.id
      INNER JOIN "permissions" sp ON sp.id = rp."permission_id"
      CROSS JOIN "permissions" p
      WHERE sp."code" IN ('settings:manage', 'marketing:manage')
        AND p."code" IN ('ai:use', 'ai:manage')
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp2
          WHERE rp2."role_id" = r.id AND rp2."permission_id" = p.id
        )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "role_permissions"
      WHERE "permission_id" IN (
        SELECT id FROM "permissions" WHERE "code" IN ('ai:use', 'ai:manage')
      )
    `)

    await queryRunner.query(`
      DELETE FROM "permissions" WHERE "code" IN ('ai:use', 'ai:manage')
    `)

    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "features" = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements("features") elem
        WHERE elem::text <> '"ai"'
      )
    `)
  }
}
