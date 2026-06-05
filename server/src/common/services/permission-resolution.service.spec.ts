import { PermissionResolutionService } from './permission-resolution.service'
import { OverrideEffect } from '@/common/enums/override-effect.enum'

describe('PermissionResolutionService', () => {
  let service: PermissionResolutionService
  let assignmentRepo: any
  let roleRepo: any
  let tenantRepo: any
  let tenantFeatureRepo: any
  let overrideRepo: any
  let cacheService: any

  beforeEach(() => {
    assignmentRepo = { find: jest.fn() }
    roleRepo = { find: jest.fn() }
    tenantRepo = { findOne: jest.fn() }
    tenantFeatureRepo = { find: jest.fn(), findOne: jest.fn() }
    overrideRepo = { find: jest.fn(), findOne: jest.fn() }
    cacheService = { getCache: jest.fn(), setCache: jest.fn(), delCache: jest.fn() }

    service = new PermissionResolutionService(
      assignmentRepo,
      roleRepo,
      tenantRepo,
      tenantFeatureRepo,
      overrideRepo,
      cacheService,
    )
  })

  describe('isFeatureEnabledForTenant', () => {
    it('returns true if a sub-feature (e.g. accounting) maps to an active plan feature (e.g. finance)', async () => {
      tenantFeatureRepo.findOne.mockResolvedValue(null) // No overrides
      tenantRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance', 'orders'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForTenant('tenant-1', 'accounting')
      expect(isEnabled).toBe(true)
    })

    it('returns false if neither the sub-feature nor the mapped plan feature is in the subscription plan', async () => {
      tenantFeatureRepo.findOne.mockResolvedValue(null)
      tenantRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['orders'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForTenant('tenant-1', 'accounting')
      expect(isEnabled).toBe(false)
    })

    it('respects sub-feature specific overrides over plan features', async () => {
      // Explicitly disabled override for 'accounting' sub-feature
      tenantFeatureRepo.findOne.mockResolvedValueOnce({ isEnabled: false }) // for 'accounting'

      tenantRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForTenant('tenant-1', 'accounting')
      expect(isEnabled).toBe(false)
    })

    it('respects parent feature overrides if sub-feature override does not exist', async () => {
      tenantFeatureRepo.findOne
        .mockResolvedValueOnce(null) // for specific 'accounting' sub-feature
        .mockResolvedValueOnce({ isEnabled: false }) // for parent 'finance' feature

      tenantRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForTenant('tenant-1', 'accounting')
      expect(isEnabled).toBe(false)
    })
  })

  describe('resolvePermissionsManifest', () => {
    it('includes permissions with sub-feature prefixes in the manifest if parent feature is enabled', async () => {
      cacheService.getCache.mockResolvedValue(null) // Force cache miss to build manifest

      // Mock subscription plan with parent 'finance' feature enabled
      tenantRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance'],
        },
      })

      // No overrides
      tenantFeatureRepo.find.mockResolvedValue([])
      overrideRepo.find.mockResolvedValue([])

      // Mock user permissions: accounting:read, hrm:read
      // Since user holds both, but plan only enables 'finance',
      // only 'accounting:read' should be filtered in (as it maps to 'finance'),
      // and 'hrm:read' should be filtered out (no 'hrm' feature).
      assignmentRepo.find.mockResolvedValue([{ roleId: 'role-1', expiresAt: null }])
      roleRepo.find.mockResolvedValue([
        {
          id: 'role-1',
          permissions: [{ code: 'accounting:read' }, { code: 'hrm:read' }],
        },
      ])

      const manifest = await service.resolvePermissionsManifest('user-1', 'tenant-1')

      expect(manifest.permissions).toContain('accounting:read')
      expect(manifest.permissions).not.toContain('hrm:read')
    })
  })
})
