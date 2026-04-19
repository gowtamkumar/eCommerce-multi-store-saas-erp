import { RequestContext } from '@/common/decorators/request-context.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { UserRole } from '@/common/enums/user/user-role.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Body, Controller, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { FilterLeadDto } from './dto/filter-lead.dto'
import { LeadResponseDto } from './dto/lead-response.dto'
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto'
import { LeadService } from './lead.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadController {
  private readonly logger = new Logger(LeadController.name)

  constructor(private readonly leadService: LeadService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT, UserRole.OPERATOR, UserRole.USER)
  async createLead(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateLeadDto,
  ): Promise<BaseApiSuccessResponse<LeadResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called createLead.`)
    const result = await this.leadService.createLead(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Lead created successfully',
      data: result as any,
    }
  }

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.STORE_MANAGER,
    UserRole.MARKETING,
    UserRole.SUPPORT,
    UserRole.OPERATOR,
  )
  async findAllLeads(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterLeadDto,
  ): Promise<BaseApiSuccessResponse<LeadResponseDto[]>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllLeads.`)
    const { leads, total } = await this.leadService.findAllLeads(filterDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'List of leads retrieved',
      data: leads as any,
      pagination: {
        total,
        page: filterDto.page || 1,
        limit: filterDto.limit || 10,
        totalPages: Math.ceil(total / (filterDto.limit || 10)),
      },
    }
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STORE_MANAGER, UserRole.SUPPORT)
  async updateLead(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ): Promise<BaseApiSuccessResponse<LeadResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateLead.`)
    const result = await this.leadService.updateLead(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Lead updated successfully',
      data: result as any,
    }
  }
}
