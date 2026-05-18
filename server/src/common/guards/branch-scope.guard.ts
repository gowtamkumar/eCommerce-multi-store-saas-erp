import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import { UserRole } from '@/common/enums/user/user-role.enum'

@Injectable()
export class BranchScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const { user } = request

    if (!user) {
      return true // Skip branch scoping for public / unauthenticated routes
    }

    const requestedBranchId = request.headers['x-branch-id'] as string

    // 👑 Rule 1: Super Admin & Corporate Admin (Store Owner) can access/switch to ANY branch
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN) {
      return true
    }

    // 🔒 Rule 2: Other roles (e.g. operators, employees, store_managers) are restricted
    if (requestedBranchId) {
      // Throw error if they try to access a branch other than their assigned home branch
      if (user.branchId !== requestedBranchId) {
        throw new ForbiddenException(
          'Access Denied: You are not authorized to access or switch to this branch.',
        )
      }
    } else {
      // Rule 3: Implicit Scoping - if no header is provided, automatically bind their assigned branch
      if (user.branchId) {
        request.headers['x-branch-id'] = user.branchId
      }
    }

    return true
  }
}
