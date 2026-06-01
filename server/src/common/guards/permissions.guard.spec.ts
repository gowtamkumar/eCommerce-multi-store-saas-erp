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

const createGuard = (requiredPermissions: string[], resolutionAllowed = false) => {
  const reflector = {
    getAllAndOverride: jest
      .fn()
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(requiredPermissions),
  } as unknown as Reflector

  const resolutionService = {
    resolvePermission: jest.fn().mockResolvedValue(resolutionAllowed),
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
    expect(resolutionService.resolvePermission).not.toHaveBeenCalled()
  })

  it('does not bypass dynamic permissions for tenant admins', async () => {
    const { guard, resolutionService, auditLogService } = createGuard(['users:read'], false)

    await expect(
      guard.canActivate(
        createContext({ id: 'user-1', role: UserRole.ADMIN, tenantId: 'tenant-1' }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException)

    expect(resolutionService.resolvePermission).toHaveBeenCalledWith(
      'user-1',
      'tenant-1',
      'users:read',
    )
    expect(auditLogService.logPermissionCheckFailed).toHaveBeenCalled()
  })
})
