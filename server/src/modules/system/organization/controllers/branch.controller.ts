import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
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
import { CreateBranchDto, UpdateBranchDto } from '../dto/branch.dto'
import { BranchService } from '../services/branch.service'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('system/branches')
export class BranchController {
  private readonly logger = new Logger(BranchController.name)

  constructor(private readonly branchService: BranchService) {}

  @Post()
  @RequireFeature('inventory')
  async create(
    @RequestContext() ctx: RequestContextDto,
    @Body() createBranchDto: CreateBranchDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username}" called create branch.`)
    const result = await this.branchService.create(createBranchDto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Branch created successfully',
      data: result,
    }
  }

  @Get()
  async findAll(@RequestContext() ctx: RequestContextDto): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.branchService.findAll(ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'List of branches',
      data: result,
    }
  }

  @Get(':id')
  async findOne(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.branchService.findOne(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Branch details',
      data: result,
    }
  }

  @Patch(':id')
  @RequireFeature('inventory')
  async update(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const result = await this.branchService.update(id, updateBranchDto, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Branch updated successfully',
      data: result,
    }
  }

  @Delete(':id')
  @RequireFeature('inventory')
  async remove(
    @RequestContext() ctx: RequestContextDto,
    @Param('id') id: string,
  ): Promise<BaseApiSuccessResponse<any>> {
    await this.branchService.remove(id, ctx)
    return {
      success: true,
      statusCode: 200,
      message: 'Branch deleted successfully',
      data: null,
    }
  }
}
