import { ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsGuard } from './permissions.guard'
import { UserRole } from '../enums/user/user-role.enum'

const createContext = (user: any) =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        method: 'GET',
        url: '/users',
        headers: {},
      }),
    }),
  }) as any

const createGuard = (
  options: {
    requiredPermissions?: string[]
    anyPermissions?: string[]
    skipPermissionCheck?: boolean
    deniedPerm?: string | null
  } = {},
) => {
  const {
    requiredPermissions = [],
    anyPermissions = [],
    skipPermissionCheck = false,
    deniedPerm = null,
  } = options

  const reflector = {
    getAllAndOverride: jest
      .fn()
      .mockImplementation((key: string) => {
        if (key === 'isPublic') return false
        if (key === 'skipPermissionCheck') return skipPermissionCheck
        if (key === 'permissions') return requiredPermissions
        if (key === 'anyPermissions') return anyPermissions
        return undefined
      }),
  } as unknown as Reflector

  const resolutionService = {
    resolvePermissionsFromManifest: jest.fn().mockResolvedValue({
      denied: deniedPerm,
      manifest: { featuresEnabled: [], permissions: [] },
    }),
  }
  const auditLogService = {
    logPermissionCheckFailed: jest.fn().mockResolvedValue(undefined),
  }

  const guard = new PermissionsGuard(
    reflector,
    resolutionService as any,
    auditLogService as any,
  )

  return { guard, resolutionService, auditLogService }
}

describe('PermissionsGuard', () => {
  it('bypasses dynamic permissions for super admins', async () => {
    const { guard, resolutionService } = createGuard({ requiredPermissions: ['users:read'] })

    await expect(
      guard.canActivate(createContext({ id: 'user-1', role: UserRole.SUPER_ADMIN })),
    ).resolves.toBe(true)
    expect(resolutionService.resolvePermissionsFromManifest).not.toHaveBeenCalled()
  })

  it('allows store admin with required permission', async () => {
    const { guard, resolutionService } = createGuard({
      requiredPermissions: ['users:read'],
      deniedPerm: null,
    })

    await expect(
      guard.canActivate(
        createContext({ id: 'user-1', role: UserRole.ADMIN, storeId: 'store-1' }),
      ),
    ).resolves.toBe(true)

    expect(resolutionService.resolvePermissionsFromManifest).toHaveBeenCalledWith(
      'user-1',
      'store-1',
      ['users:read'],
      expect.objectContaining({ branchId: undefined, warehouseId: undefined }),
    )
  })

  it('denies store admin without required permission and logs the failure', async () => {
    const { guard, resolutionService, auditLogService } = createGuard({
      requiredPermissions: ['users:read'],
      deniedPerm: 'users:read',
    })

    await expect(
      guard.canActivate(
        createContext({ id: 'user-1', role: UserRole.ADMIN, storeId: 'store-1' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException)

    expect(resolutionService.resolvePermissionsFromManifest).toHaveBeenCalled()
    expect(auditLogService.logPermissionCheckFailed).toHaveBeenCalled()
  })

  it('denies routes without explicit permission metadata', async () => {
    const { guard } = createGuard()

    await expect(
      guard.canActivate(
        createContext({ id: 'user-1', role: UserRole.ADMIN, storeId: 'store-1' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException)
  })

  it('allows routes marked with skip permission check', async () => {
    const { guard, resolutionService } = createGuard({ skipPermissionCheck: true })

    await expect(
      guard.canActivate(
        createContext({ id: 'user-1', role: UserRole.ADMIN, storeId: 'store-1' }),
      ),
    ).resolves.toBe(true)
    expect(resolutionService.resolvePermissionsFromManifest).not.toHaveBeenCalled()
  })
})
