import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { CreateReusableBlockDto, UpdateReusableBlockDto } from './dto/page.dto'
import { PageReusableBlockService } from './page-reusable-block.service'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('content')
@RequirePermissions(SystemPermissions.CONTENT_MANAGE)
@Controller('pages/reusable-blocks')
export class PageReusableBlockController {
  private readonly logger = new Logger(PageReusableBlockController.name)

  constructor(private readonly service: PageReusableBlockService) {}

  @Post()
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: CreateReusableBlockDto,
  ): Promise<BaseApiSuccessResponse<unknown>> {
    const data = await this.service.create(dto, ctx)
    return { success: true, statusCode: 201, message: 'Reusable block saved', data }
  }

  @Get()
  async list(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<unknown[]>> {
    const data = await this.service.list(ctx)
    return { success: true, statusCode: 200, message: 'Reusable blocks', data }
  }

  @Get(':id')
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<unknown>> {
    const data = await this.service.findOne(id, ctx)
    return { success: true, statusCode: 200, message: 'Reusable block', data }
  }

  @Patch(':id')
  async update(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() dto: UpdateReusableBlockDto,
  ): Promise<BaseApiSuccessResponse<unknown>> {
    const data = await this.service.update(id, dto, ctx)
    return { success: true, statusCode: 200, message: 'Reusable block updated', data }
  }

  @Delete(':id')
  async remove(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    const result = await this.service.remove(id, ctx)
    return { success: true, statusCode: 200, message: result.message, data: null }
  }
}
