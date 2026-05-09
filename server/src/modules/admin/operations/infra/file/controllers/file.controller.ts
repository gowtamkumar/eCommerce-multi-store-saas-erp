import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Logger,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { FilterFileDto } from '../dtos'
import { FileResponseDto } from '../dtos/file-response.dto'
import { FilesService } from '../services/file.service'

@Controller('admin/media')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/media')
export class AdminMediaController {
  private readonly logger = new Logger(AdminMediaController.name)

  constructor(private readonly filesService: FilesService) {}

  @Get()
  async findAllFiles(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: FilterFileDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllFiles.`)
    const result = await this.filesService.getFiles(filterDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Files retrieved successfully',
      data: result,
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'public/uploads',
        filename: (req, file, cb) => {
          const fileNameSplit = file.originalname.split('.')
          const fileExt = fileNameSplit[fileNameSplit.length - 1]
          const justFileName = fileNameSplit[0]
          cb(null, `${Date.now()}_${justFileName}.${fileExt}`)
        },
      }),
    }),
  )
  async uploadFile(
    @RequestContext() ctx: RequestContextDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType: 'image/(png|jpeg|jpg|gif|svg|webp)',
            fallbackToMimetype: true,
          }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<BaseApiSuccessResponse<FileResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called uploadFile.`)
    const newFile = await this.filesService.createFile(file, ctx)
    return {
      success: true,
      statusCode: 201,
      message: 'File uploaded successfully',
      data: newFile,
    }
  }

  @Delete(':id')
  async removeFile(
    @RequestContext() ctx: RequestContextDto,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BaseApiSuccessResponse<null>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeFile.`)
    await this.filesService.deleteFile(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'File deleted successfully',
      data: null,
    }
  }
}
