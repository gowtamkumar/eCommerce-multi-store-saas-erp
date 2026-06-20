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

/**
 * resolutionService mock now uses resolvePermissionsFromManifest() which returns
 * { denied: string | null, manifest: PermissionManifest }.
 */
const createGuard = (requiredPermissions: string[], deniedPerm: string | null = null) => {
  const reflector = {
    getAllAndOverride: jest
      .fn()
      .mockReturnValueOnce(false) // isPublic
      .mockReturnValueOnce(requiredPermissions), // requiredPermissions
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
    {} as any,
    {} as any,
    resolutionService as any,
    auditLogService as any,
  )

  return { guard, resolutionService, auditLogService }
}

describe('PermissionsGuard', () => {
  it('bypasses dynamic permissions for super admins', async () => {
    const { guard, resolutionService } = createGuard(['users:read'])

    await expect(
      guard.canActivate(createContext({ id: 'user-1', role: UserRole.SUPER_ADMIN })),
    ).resolves.toBe(true)
    expect(resolutionService.resolvePermissionsFromManifest).not.toHaveBeenCalled()
  })

  it('allows tenant admin with required permission', async () => {
    const { guard, resolutionService } = createGuard(['users:read'], null /* no denied perm */)

    await expect(
      guard.canActivate(
        createContext({ id: 'user-1', role: UserRole.ADMIN, tenantId: 'tenant-1' }),
      ),
    ).resolves.toBe(true)

    expect(resolutionService.resolvePermissionsFromManifest).toHaveBeenCalledWith(
      'user-1',
      'tenant-1',
      ['users:read'],
    )
  })

  it('denies tenant admin without required permission and logs the failure', async () => {
    const { guard, resolutionService, auditLogService } = createGuard(
      ['users:read'],
      'users:read', // denied
    )

    await expect(
      guard.canActivate(
        createContext({ id: 'user-1', role: UserRole.ADMIN, tenantId: 'tenant-1' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException)

    expect(resolutionService.resolvePermissionsFromManifest).toHaveBeenCalledWith(
      'user-1',
      'tenant-1',
      ['users:read'],
    )
    expect(auditLogService.logPermissionCheckFailed).toHaveBeenCalled()
  })
})
