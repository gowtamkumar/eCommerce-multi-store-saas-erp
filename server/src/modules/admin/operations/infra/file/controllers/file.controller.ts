import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { SkipPermissionCheck } from '@/common/decorators/skip-permission-check.decorator'
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
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { FilterFileDto, GetPresignedUrlDto } from '../dtos'
import { FilesService } from '../services/file.service'

@Controller('admin/media')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('catalog')
export class AdminMediaController {
  private readonly logger = new Logger(AdminMediaController.name)

  constructor(private readonly filesService: FilesService) {}

  @Get()
  @RequirePermissions(SystemPermissions.CONTENT_MANAGE)
  async findAllFiles(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterFileDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllFiles.`)
    const result = await this.filesService.getFiles(filterDto, ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Files retrieved successfully',
      data: result,
    }
  }

  @Post('presigned-url')
  @SkipPermissionCheck()
  async getPresignedUrl(
    @RequestContext() ctx: RequestContextDto,
    @Body() dto: GetPresignedUrlDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getPresignedUrl.`)
    const result = await this.filesService.generatePresignedUpload(dto, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'Presigned upload URL generated successfully',
      data: result,
    }
  }

  @Delete(':id')
  @RequirePermissions(SystemPermissions.CONTENT_MANAGE)
  async removeFile(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeFile.`)
    await this.filesService.deleteFile(id, ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'File deleted successfully',
      data: null,
    }
  }
}
