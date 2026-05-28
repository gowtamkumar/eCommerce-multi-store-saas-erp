import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Simplification: Remove role inheritance from the roles table.
 *
 * The `parent_role_id` column was part of a planned role inheritance feature
 * where a role's effective permissions would include those of its parent chain.
 * This added significant complexity (recursive DB walks, circular reference guards)
 * with no active usage.
 *
 * Roles are now FLAT. To combine permissions, assign multiple roles to a user —
 * the resolver unions all active role assignments automatically.
 *
 * What is kept (for future use):
 *   - scope_type / scope_id on user_role_assignments  (branch/warehouse scoping)
 *   - user_permission_overrides table                 (explicit ALLOW/DENY per user)
 */
export class RemoveRoleInheritance1780000000000 implements MigrationInterface {
  name = 'RemoveRoleInheritance1780000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the FK constraint first, then the column
    await queryRunner.query(`
      ALTER TABLE "roles"
      DROP CONSTRAINT IF EXISTS "FK_roles_parent_role_id"
    `)

    await queryRunner.query(`
      ALTER TABLE "roles"
      DROP COLUMN IF EXISTS "parent_role_id"
    `)

    // Also drop the default scope_type column from roles
    // (was a UI suggestion hint — no longer needed since roles are flat)
    await queryRunner.query(`
      ALTER TABLE "roles"
      DROP COLUMN IF EXISTS "scope_type"
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore scope_type
    await queryRunner.query(`
      ALTER TABLE "roles"
      ADD COLUMN IF NOT EXISTS "scope_type" VARCHAR DEFAULT 'global'
    `)

    // Restore parent_role_id
    await queryRunner.query(`
      ALTER TABLE "roles"
      ADD COLUMN IF NOT EXISTS "parent_role_id" UUID
    `)

    await queryRunner.query(`
      ALTER TABLE "roles"
      ADD CONSTRAINT "FK_roles_parent_role_id"
      FOREIGN KEY ("parent_role_id") REFERENCES "roles"("id") ON DELETE SET NULL
    `)
  }
}
