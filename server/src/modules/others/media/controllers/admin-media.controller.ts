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
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { TenantId } from 'src/common/decorators/tenant-id.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { FilterFileDto } from '../dtos'
import { FilesService } from '../services/file.service'

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminMediaController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async findAllFiles(@Query() filterDto: FilterFileDto, @TenantId() tenantId: string) {
    const files = await this.filesService.getFiles(filterDto, tenantId)
    return {
      success: true,
      statusCode: 200,
      data: files,
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
    @TenantId() tenantId: string,
  ) {
    const newFile = await this.filesService.createFile(file, tenantId)
    return {
      success: true,
      statusCode: 201,
      message: 'File uploaded successfully',
      data: newFile,
    }
  }

  @Delete(':id')
  async removeFile(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    await this.filesService.deleteFile(id, tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'File deleted successfully',
    }
  }
}
