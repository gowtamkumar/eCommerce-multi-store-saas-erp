import { Test, TestingModule } from '@nestjs/testing'
import { TenantService } from './tenant.service'
import { TenantRepository } from './tenant.repository'
import { getRepositoryToken } from '@nestjs/typeorm'
import { TenantFeatureEntity } from './entities/tenant-feature.entity'
import { UserRoleAssignmentEntity } from '@/modules/admin/core/user/entities/user-role-assignment.entity'
import { UserRepository } from '@/modules/admin/core/user/repositories/user.repository'
import { SubscriptionPlanService } from '@/modules/system/subscription-plan/subscription-plan.service'
import { CacheService } from '@/modules/admin/operations/infra/cache/cache.service'
import { MailService } from '@/modules/admin/operations/infra/mail/mail.service'
import { SettingsService } from '@/modules/admin/settings/settings.service'
import { RoleManagementService } from '@/modules/admin/core/rbac/role-management.service'
import { DataSource } from 'typeorm'
import { TenantEntity } from './entities/tenant.entity'
import { SubscriptionPlanEntity } from '@/modules/system/subscription-plan/entities/subscription-plan.entity'
import { NotFoundException } from '@nestjs/common'
import { NotificationService } from '@/modules/admin/operations/infra/notification/notification.service'

describe('TenantService', () => {
  let service: TenantService
  let tenantRepository: any
  let subscriptionPlanService: any
  let cacheService: any
  let userRepository: any
  let dataSource: any

  const mockManager = {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity === TenantEntity) {
        return {
          save: jest.fn().mockImplementation((t) => Promise.resolve(t)),
        }
      }
      if (entity === TenantFeatureEntity) {
        return {
          find: jest.fn().mockResolvedValue([
            { featureSlug: '/admin/hrm', isEnabled: true, tenantId: 'tenant-1' },
            { featureSlug: '/admin', isEnabled: true, tenantId: 'tenant-1' },
          ]),
          create: jest.fn().mockImplementation((dto) => dto),
          save: jest.fn().mockResolvedValue([]),
        }
      }
    }),
  }

  beforeEach(async () => {
    tenantRepository = {
      findOneTenants: jest.fn(),
    }
    subscriptionPlanService = {
      findOneSubscriptionPlan: jest.fn(),
    }
    cacheService = {
      getCache: jest.fn(),
      delCache: jest.fn(),
    }
    userRepository = {
      findTeamMembers: jest.fn().mockResolvedValue([{ id: 'user-1' }, { id: 'user-2' }]),
    }
    dataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: TenantRepository, useValue: tenantRepository },
        { provide: getRepositoryToken(TenantFeatureEntity), useValue: {} },
        { provide: getRepositoryToken(UserRoleAssignmentEntity), useValue: {} },
        { provide: UserRepository, useValue: userRepository },
        { provide: SubscriptionPlanService, useValue: subscriptionPlanService },
        { provide: CacheService, useValue: cacheService },
        { provide: MailService, useValue: {} },
        { provide: SettingsService, useValue: {} },
        { provide: RoleManagementService, useValue: {} },
        { provide: DataSource, useValue: dataSource },
        {
          provide: NotificationService,
          useValue: { createNotification: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile()

    service = module.get<TenantService>(TenantService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('updateTenantPlan', () => {
    it('should throw NotFoundException if new plan is not found', async () => {
      const mockTenant = {
        id: 'tenant-1',
        subdomain: 'sub',
        domains: [],
      } as TenantEntity
      jest.spyOn(service, 'findOneTenants').mockResolvedValue(mockTenant)
      subscriptionPlanService.findOneSubscriptionPlan.mockResolvedValue(null)

      await expect(service.updateTenantPlan('tenant-1', 'plan-2')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should update plan, sync features, and invalidate caches inside transaction', async () => {
      const mockTenant = {
        id: 'tenant-1',
        subdomain: 'sub',
        domains: [],
        subscriptionPlanId: 'plan-1',
      } as TenantEntity
      const mockPlan = {
        id: 'plan-2',
        name: 'Pro Seller',
        features: ['/admin', '/admin/pos'],
      } as SubscriptionPlanEntity

      jest.spyOn(service, 'findOneTenants').mockResolvedValue(mockTenant)
      subscriptionPlanService.findOneSubscriptionPlan.mockResolvedValue(mockPlan)

      const result = await service.updateTenantPlan('tenant-1', 'plan-2')

      expect(result.subscriptionPlanId).toBe('plan-2')
      expect(dataSource.transaction).toHaveBeenCalled()
      expect(cacheService.delCache).toHaveBeenCalledWith('tenant:id:tenant-1')
      expect(cacheService.delCache).toHaveBeenCalledWith('rbac:manifest:tenant-1:user-1')
      expect(cacheService.delCache).toHaveBeenCalledWith('rbac:manifest:tenant-1:user-2')
    })
  })
})
