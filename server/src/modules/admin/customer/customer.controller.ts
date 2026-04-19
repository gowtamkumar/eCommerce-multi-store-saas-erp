import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common'
import { Roles } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { UserService } from '@/modules/admin/core/user/services/user.service'
import { FilterUserDto } from '@/modules/admin/core/user/dtos/filter-user.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customer')
export class CustomerController {
  private readonly logger = new Logger(CustomerController.name)

  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query() query: FilterUserDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" fetching customer list.`)

    // Force role to USER to only fetch customers
    const { users, total } = await this.userService.getUsers(
      { ...query, role: UserRole.USER } as any,
      ctx,
    )

    // Map name to firstName/lastName for frontend compatibility
    const mappedCustomers = users.map((user) => {
      const parts = (user.name || '').split(' ')
      return {
        ...user,
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
      }
    })

    return {
      success: true,
      statusCode: 200,
      message: 'Customer list retrieved successfully',
      data: {
        items: mappedCustomers,
        total,
      } as any,
    }
  }
}
