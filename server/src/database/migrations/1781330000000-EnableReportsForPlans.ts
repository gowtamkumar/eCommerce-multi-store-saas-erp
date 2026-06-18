import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnableReportsForPlans1781330000000 implements MigrationInterface {
  name = 'EnableReportsForPlans1781330000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "features" = "features" || '["reports"]'::jsonb
      WHERE NOT ("features" @> '["reports"]'::jsonb)
    `)

    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r."is_system_role" = true
        AND NOT EXISTS (
          SELECT 1 FROM "role_permissions" rp
          WHERE rp."role_id" = r.id AND rp."permission_id" = p.id
        )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "subscription_plans"
      SET "features" = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements("features") elem
        WHERE elem::text <> '"reports"'
      )
      WHERE "code" IN ('starter', 'pro_seller')
    `)
  }
}
