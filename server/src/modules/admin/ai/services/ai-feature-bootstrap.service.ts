import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { RoleRepository } from '@/modules/admin/core/user/repositories/role.repository'

/**
 * Ensures existing stores can use AI after the feature was introduced.
 * Uses SQL inserts only — never TypeORM save() on partial permission relations.
 */
@Injectable()
export class AiFeatureBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AiFeatureBootstrapService.name)

  constructor(
    private readonly roleRepo: RoleRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensurePlanFeature()
    await this.backfillRolePermissions()
  }

  private async ensurePlanFeature(): Promise<void> {
    await this.roleRepo.txRepo().manager.query(`
      UPDATE "subscription_plans"
      SET "features" = "features" || '["ai"]'::jsonb
      WHERE NOT ("features" @> '["ai"]'::jsonb)
    `)
  }

  private async backfillRolePermissions(): Promise<void> {
    const result = await this.roleRepo.txRepo().manager.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      INNER JOIN "permissions" p ON p.code IN ('ai:use', 'ai:manage', 'ai:use:hrm', 'ai:use:finance')
      WHERE (
        r."is_system_role" = true
        OR r.name = 'Branch Manager'
        OR EXISTS (
          SELECT 1
          FROM "role_permissions" rp
          INNER JOIN "permissions" sp ON sp.id = rp."permission_id"
          WHERE rp."role_id" = r.id
            AND sp.code IN ('settings:manage', 'marketing:manage')
        )
      )
      AND NOT EXISTS (
        SELECT 1 FROM "role_permissions" rp
        WHERE rp."role_id" = r.id AND rp."permission_id" = p.id
      )
    `)

    const inserted = typeof result?.[1] === 'number' ? result[1] : 0
    if (inserted > 0) {
      this.logger.log(`Backfilled AI permissions (${inserted} new role-permission links)`)
    }
  }
}
