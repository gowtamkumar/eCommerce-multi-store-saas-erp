import { PermissionResolutionService } from './permission-resolution.service'
import { OverrideEffect } from '@/common/enums/override-effect.enum'

describe('PermissionResolutionService', () => {
  let service: PermissionResolutionService
  let assignmentRepo: any
  let roleRepo: any
  let storeRepo: any
  let storeFeatureRepo: any
  let overrideRepo: any
  let cacheService: any

  beforeEach(() => {
    assignmentRepo = { find: jest.fn() }
    roleRepo = { find: jest.fn() }
    storeRepo = { findOne: jest.fn() }
    storeFeatureRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
      create: jest.fn((entity) => entity),
    }
    overrideRepo = { find: jest.fn(), findOne: jest.fn() }
    cacheService = { getCache: jest.fn(), setCache: jest.fn(), delCache: jest.fn() }

    service = new PermissionResolutionService(
      assignmentRepo,
      roleRepo,
      storeRepo,
      storeFeatureRepo,
      overrideRepo,
      cacheService,
    )
  })

  describe('isFeatureEnabledForStore', () => {
    it('returns true if a sub-feature (e.g. accounting) maps to an active plan feature (e.g. finance)', async () => {
      storeFeatureRepo.findOne.mockResolvedValue(null) // No overrides
      storeRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance', 'orders'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForStore('store-1', 'accounting')
      expect(isEnabled).toBe(true)
    })

    it('returns false if neither the sub-feature nor the mapped plan feature is in the subscription plan', async () => {
      storeFeatureRepo.findOne.mockResolvedValue(null)
      storeRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['orders'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForStore('store-1', 'accounting')
      expect(isEnabled).toBe(false)
    })

    it('respects sub-feature specific overrides over plan features', async () => {
      // Explicitly disabled override for 'accounting' sub-feature
      storeFeatureRepo.findOne.mockResolvedValueOnce({ isEnabled: false }) // for 'accounting'

      storeRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForStore('store-1', 'accounting')
      expect(isEnabled).toBe(false)
    })

    it('respects parent feature overrides if sub-feature override does not exist', async () => {
      storeFeatureRepo.findOne
        .mockResolvedValueOnce(null) // for specific 'accounting' sub-feature
        .mockResolvedValueOnce({ isEnabled: false }) // for parent 'finance' feature

      storeRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance'],
        },
      })

      const isEnabled = await service.isFeatureEnabledForStore('store-1', 'accounting')
      expect(isEnabled).toBe(false)
    })
  })

  describe('resolvePermissionsFromManifest', () => {
    it('returns denied=null when all permissions are in the cached manifest (0 DB queries)', async () => {
      // Cache hit — no DB calls should be made
      cacheService.getCache.mockResolvedValue({
        featuresEnabled: ['finance'],
        permissions: ['accounting:read', 'accounting:write'],
      })

      const result = await service.resolvePermissionsFromManifest('user-1', 'store-1', [
        'accounting:read',
        'accounting:write',
      ])

      expect(result.denied).toBeNull()
      // Confirm no DB queries were run
      expect(storeRepo.findOne).not.toHaveBeenCalled()
      expect(assignmentRepo.find).not.toHaveBeenCalled()
    })

    it('returns denied=permSlug when the feature is not enabled in manifest', async () => {
      // Cache hit — feature not enabled
      cacheService.getCache.mockResolvedValue({
        featuresEnabled: ['catalog'],
        permissions: ['catalog:read'],
      })

      const result = await service.resolvePermissionsFromManifest('user-1', 'store-1', [
        'accounting:read', // finance feature not in featuresEnabled
      ])

      expect(result.denied).toBe('accounting:read')
    })

    it('returns denied=permSlug when the permission is missing from manifest', async () => {
      // Cache hit — feature enabled but permission not granted
      cacheService.getCache.mockResolvedValue({
        featuresEnabled: ['finance'],
        permissions: ['accounting:read'], // no 'accounting:write'
      })

      const result = await service.resolvePermissionsFromManifest('user-1', 'store-1', [
        'accounting:read',
        'accounting:write', // this one is missing
      ])

      expect(result.denied).toBe('accounting:write')
    })
  })

  describe('resolvePermissionsManifest', () => {
    it('includes hrm role permissions when plan lacks hrm (RBAC enables store feature)', async () => {
      cacheService.getCache.mockResolvedValue(null)

      storeRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['catalog', 'orders'],
        },
      })

      storeFeatureRepo.find.mockResolvedValue([])
      storeFeatureRepo.findOne.mockResolvedValue(null)
      overrideRepo.find.mockResolvedValue([])

      assignmentRepo.find.mockResolvedValue([
        {
          roleId: 'role-hrm',
          expiresAt: null,
          role: {
            permissions: [
              { code: 'hrm:manage-employees' },
              { code: 'hrm:view-attendance-report' },
            ],
          },
        },
      ])

      const manifest = await service.resolvePermissionsManifest('user-1', 'store-1')

      expect(manifest.permissions).toContain('hrm:manage-employees')
      expect(manifest.permissions).toContain('hrm:view-attendance-report')
      expect(manifest.featuresEnabled).toContain('hrm')
      expect(storeFeatureRepo.save).toHaveBeenCalled()
    })

    it('filters hrm permissions when store plan lacks hrm, and exposes hrm in featuresEnabled when enabled', async () => {
      cacheService.getCache.mockResolvedValue(null)

      storeRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['hrm'],
        },
      })

      storeFeatureRepo.find.mockResolvedValue([])
      overrideRepo.find.mockResolvedValue([])

      assignmentRepo.find.mockResolvedValue([
        {
          roleId: 'role-hrm',
          expiresAt: null,
          role: {
            permissions: [
              { code: 'hrm:manage-employees' },
              { code: 'hrm:view-attendance-report' },
            ],
          },
        },
      ])

      const manifest = await service.resolvePermissionsManifest('user-1', 'store-1')

      expect(manifest.permissions).toContain('hrm:manage-employees')
      expect(manifest.permissions).toContain('hrm:view-attendance-report')
      expect(manifest.featuresEnabled).toContain('hrm')
      expect(manifest.featuresEnabled).not.toContain('catalog')
    })

    it('includes accounting permissions when finance is on plan; role-granted hrm when in role', async () => {
      cacheService.getCache.mockResolvedValue(null)

      storeRepo.findOne.mockResolvedValue({
        subscriptionPlan: {
          features: ['finance'],
        },
      })

      storeFeatureRepo.find.mockResolvedValue([])
      storeFeatureRepo.findOne.mockResolvedValue(null)
      overrideRepo.find.mockResolvedValue([])

      assignmentRepo.find.mockResolvedValue([
        {
          roleId: 'role-1',
          expiresAt: null,
          role: {
            permissions: [{ code: 'accounting:read' }, { code: 'hrm:view-attendance-report' }],
          },
        },
      ])

      const manifest = await service.resolvePermissionsManifest('user-1', 'store-1')

      expect(manifest.permissions).toContain('accounting:read')
      expect(manifest.permissions).toContain('hrm:view-attendance-report')
      expect(manifest.featuresEnabled).toContain('finance')
      expect(manifest.featuresEnabled).toContain('hrm')
    })
  })
})
