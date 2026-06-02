import { OverrideEffect } from '@/common/enums/override-effect.enum'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'
import { UserEntity } from '@/modules/admin/core/user/entities/user.entity'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

export interface CreateOverrideDto {
  permissionSlug: string
  effect: OverrideEffect
  reason: string
  expiresAt: Date
}

/**
 * Manages explicit permission overrides (allow/deny) for specific users.
 */
@Injectable()
export class UserPermissionOverrideService {
  private readonly logger = new Logger(UserPermissionOverrideService.name)

  constructor(
    @InjectRepository(UserPermissionOverrideEntity)
    private readonly overrideRepo: Repository<UserPermissionOverrideEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    private readonly auditLogService: AuditLogService,
    private readonly permissionResolutionService: PermissionResolutionService,
  ) {}

  async getActiveOverrides(
    userId: string,
    tenantId: string,
  ): Promise<UserPermissionOverrideEntity[]> {
    const now = new Date()
    const overrides = await this.overrideRepo.find({
      where: { userId, tenantId },
    })
    return overrides.filter((o) => !o.expiresAt || new Date(o.expiresAt) > now)
  }

  async addOverride(
    targetUserId: string,
    tenantId: string,
    actorId: string,
    actorName: string,
    dto: CreateOverrideDto,
  ): Promise<UserPermissionOverrideEntity> {
    if (!dto.reason) {
      throw new BadRequestException('A reason must be provided when adding a permission override.')
    }
    if (!dto.expiresAt) {
      throw new BadRequestException('Overrides must have an expiration date.')
    }

    const user = await this.userRepo.findOne({ where: { id: targetUserId, tenantId } })
    if (!user) throw new NotFoundException('User not found in this tenant')

    // Remove any existing active override for this exact permission to avoid conflicts
    const existing = await this.overrideRepo.findOne({
      where: { userId: targetUserId, tenantId, permissionSlug: dto.permissionSlug },
    })
    if (existing) {
      await this.overrideRepo.remove(existing)
    }

    const override = this.overrideRepo.create({
      userId: targetUserId,
      tenantId,
      permissionSlug: dto.permissionSlug,
      effect: dto.effect,
      reason: dto.reason,
      overrideBy: actorId,
      expiresAt: dto.expiresAt,
    })

    const saved = await this.overrideRepo.save(override)

    await this.auditLogService.logPermissionOverrideAdded(
      tenantId,
      actorId,
      actorName,
      targetUserId,
      dto.permissionSlug,
      dto.effect,
      dto.reason,
      dto.expiresAt,
    )

    await this.permissionResolutionService.invalidateUserPermissionCache(targetUserId, tenantId)

    return saved
  }

  async removeOverride(
    overrideId: string,
    tenantId: string,
    actorId: string,
    actorName: string,
  ): Promise<void> {
    const override = await this.overrideRepo.findOne({
      where: { id: overrideId, tenantId },
    })

    if (!override) throw new NotFoundException('Permission override not found')

    await this.auditLogService.logPermissionOverrideRemoved(
      tenantId,
      actorId,
      actorName,
      overrideId,
      override.userId,
      override.permissionSlug,
    )

    await this.overrideRepo.remove(override)
    await this.permissionResolutionService.invalidateUserPermissionCache(override.userId, tenantId)
  }
}
