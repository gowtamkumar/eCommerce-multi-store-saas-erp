import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Audit } from '@/common/decorators/audit.decorator'
import { DebitNoteService } from '../services/debit-note.service'
import { CreateDebitNoteDto, UpdateDebitNoteStatusDto } from '../dto/debit-note.dto'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { DebitNoteStatus } from '../entities/debit-note.entity'

@ApiTags('Debit Notes')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('purchasing')
@Controller('debit-notes')
export class DebitNoteController {
  constructor(private readonly service: DebitNoteService) {}

  @Post()
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @Audit({ entity: 'DebitNote', action: 'CREATE' })
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateDebitNoteDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.createDebitNote(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Debit Note created successfully',
      data: result,
    }
  }

  @Get()
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query() pagination: PaginationDto,
    @Query('status') status?: DebitNoteStatus,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findAllDebitNotes(ctx, pagination, status)
    return {
      success: true,
      statusCode: 200,
      message: 'Debit Notes retrieved successfully',
      data: result,
    }
  }

  @Get(':id')
  @RequirePermissions(SystemPermissions.PURCHASING_READ)
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.findOneDebitNote(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Debit Note retrieved successfully',
      data: result,
    }
  }

  @Patch(':id/status')
  @RequirePermissions(SystemPermissions.PURCHASING_WRITE)
  @Audit({ entity: 'DebitNote', action: 'STATUS_CHANGE' })
  async updateStatus(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateDebitNoteStatusDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.service.updateDebitNoteStatus(id, dto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Debit Note status updated successfully',
      data: result,
    }
  }
}
