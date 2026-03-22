import {
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors, Logger
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { RequestContext } from "@/common/decorators/request-context.decorator";
import { RequestContextDto } from "@/common/dto/request-context.dto";
import { UserRole } from '@/common/enums/user/user-role.enum'
import { FilesService } from '../services/file.service'
import { FilterFileDto } from '../dtos'
import { Roles } from '@/common/decorators/roles.decorator'

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminMediaController {
  private readonly logger = new Logger(AdminMediaController.name);

  constructor(private readonly filesService: FilesService) { }

  @Get()
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing, UserRole.Support)
  async findAllFiles(@RequestContext() ctx: RequestContextDto, @Query() filterDto: FilterFileDto) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllFiles.`);
    const files = await this.filesService.getFiles(filterDto, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      data: files,
    }
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
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
    @RequestContext() ctx: RequestContextDto, @UploadedFile(
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
    file: Express.Multer.File
  ) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called uploadFile.`);
    const newFile = await this.filesService.createFile(file, ctx.tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'File uploaded successfully',
      data: newFile,
    }
  }

  @Delete(':id')
  @Roles(UserRole.Admin, UserRole.StoreManager, UserRole.Marketing)
  async removeFile(@RequestContext() ctx: RequestContextDto, @Param('id', ParseUUIDPipe) id: string) {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called removeFile.`);
    await this.filesService.deleteFile(id, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'File deleted successfully',
    }
  }
}
