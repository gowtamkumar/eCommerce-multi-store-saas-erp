import { OverrideEffect } from '@/common/enums/override-effect.enum'
import { UserPermissionOverrideEntity } from '@/modules/admin/core/user/entities/user-permission-override.entity'
import { AuditLogService } from '@/modules/system/audit-log/audit-log.service'
import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { IsNull, MoreThan } from 'typeorm'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { UserPermissionOverrideRepository } from '@/modules/admin/core/user/repositories/user-permission-override.repository'

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
    private readonly overrideRepo: UserPermissionOverrideRepository,
    private readonly userRepo: UserRepository,
    private readonly auditLogService: AuditLogService,
    private readonly permissionResolutionService: PermissionResolutionService,
  ) {}

  async getActiveOverrides(
    userId: string,
    storeId: string,
  ): Promise<UserPermissionOverrideEntity[]> {
    const now = new Date()
    return this.overrideRepo.find({
      where: [
        { userId, storeId, expiresAt: IsNull() },
        { userId, storeId, expiresAt: MoreThan(now) },
      ],
    })
  }

  async addOverride(
    targetUserId: string,
    storeId: string,
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

    const user = await this.userRepo.findByIdAndStore(targetUserId, storeId)
    if (!user) throw new NotFoundException('User not found in this store')

    // Remove any existing active override for this exact permission to avoid conflicts
    const existing = await this.overrideRepo.findOne({
      where: { userId: targetUserId, storeId, permissionSlug: dto.permissionSlug },
    })
    if (existing) {
      await this.overrideRepo.remove(existing)
    }

    const override = this.overrideRepo.create({
      userId: targetUserId,
      storeId,
      permissionSlug: dto.permissionSlug,
      effect: dto.effect,
      reason: dto.reason,
      overrideBy: actorId,
      expiresAt: dto.expiresAt,
    })

    const saved = await this.overrideRepo.save(override)

    await this.auditLogService.logPermissionOverrideAdded(
      storeId,
      actorId,
      actorName,
      targetUserId,
      dto.permissionSlug,
      dto.effect,
      dto.reason,
      dto.expiresAt,
    )

    await this.permissionResolutionService.invalidateUserPermissionCache(targetUserId, storeId)

    return saved
  }

  async removeOverride(
    overrideId: string,
    storeId: string,
    actorId: string,
    actorName: string,
  ): Promise<void> {
    const override = await this.overrideRepo.findOne({
      where: { id: overrideId, storeId },
    })

    if (!override) throw new NotFoundException('Permission override not found')

    await this.auditLogService.logPermissionOverrideRemoved(
      storeId,
      actorId,
      actorName,
      overrideId,
      override.userId,
      override.permissionSlug,
    )

    await this.overrideRepo.remove(override)
    await this.permissionResolutionService.invalidateUserPermissionCache(override.userId, storeId)
  }
}
