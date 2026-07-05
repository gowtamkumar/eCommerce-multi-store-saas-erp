import { BaseStoreRepository } from '@/common/base-repository'
import { RoleEntity } from '@/modules/admin/core/user/entities/role.entity'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm'

@Injectable()
export class RoleRepository extends BaseStoreRepository<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    repo: Repository<RoleEntity>,
  ) {
    super(RoleEntity, repo)
  }

  get manager() {
    return this.repo.manager
  }

  async syncSystemRolePermissions(): Promise<number> {
    const result = await this.repo.manager.query(`
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
    return typeof result?.[1] === 'number' ? result[1] : 0
  }

  async syncDefaultRolePermissions(
    defaultRoleDefs: Array<{ name: string; permCodes: string[] }>,
  ): Promise<number> {
    let inserted = 0

    for (const def of defaultRoleDefs) {
      const result = await this.repo.manager.query(
        `
        INSERT INTO "role_permissions" ("role_id", "permission_id")
        SELECT r.id, p.id
        FROM "roles" r
        INNER JOIN "permissions" p ON p.code = ANY($1::text[])
        WHERE r.name = $2
          AND r."is_system_role" = false
          AND NOT EXISTS (
            SELECT 1 FROM "role_permissions" rp
            WHERE rp."role_id" = r.id AND rp."permission_id" = p.id
          )
      `,
        [def.permCodes, def.name],
      )

      if (typeof result?.[1] === 'number') {
        inserted += result[1]
      }
    }
    return inserted
  }

  create(data: DeepPartial<RoleEntity>): RoleEntity {
    return this.repo.create(data)
  }

  async save(role: RoleEntity): Promise<RoleEntity> {
    return this.repo.save(role)
  }

  async find(options?: FindManyOptions<RoleEntity>): Promise<RoleEntity[]> {
    return this.repo.find(options)
  }

  async findOne(options: FindOneOptions<RoleEntity>): Promise<RoleEntity | null> {
    return this.repo.findOne(options)
  }

  async remove(role: RoleEntity): Promise<RoleEntity> {
    return this.repo.remove(role)
  }
}
