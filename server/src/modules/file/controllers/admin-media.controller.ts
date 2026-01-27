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
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FilterFileDto } from '../dtos';
import { FilesService } from '../services/file.service';

@ApiTags('Admin Media')
@Controller('admin/media')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.Admin, UserRole.SuperAdmin)
export class AdminMediaController {
    constructor(private readonly filesService: FilesService) { }

    @Get()
    @ApiOperation({ summary: 'Get all media files' })
    async findAll(@Query() filterDto: FilterFileDto) {
        const files = await this.filesService.getFiles(filterDto);
        return {
            success: true,
            statusCode: 200,
            data: files,
        };
    }

    @Post()
    @ApiOperation({ summary: 'Upload media file' })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: 'public/uploads',
                filename: (req, file, cb) => {
                    const fileNameSplit = file.originalname.split('.');
                    const fileExt = fileNameSplit[fileNameSplit.length - 1];
                    const justFileName = fileNameSplit[0];
                    cb(null, `${Date.now()}_${justFileName}.${fileExt}`);
                },
            }),
        }),
    )
    async upload(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: 'image/(png|jpeg|jpg|gif|svg|webp)', fallbackToMimetype: true }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        const newFile = await this.filesService.createFile(file);
        return {
            success: true,
            statusCode: 201,
            message: 'File uploaded successfully',
            data: newFile,
        };
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete media file' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.filesService.deleteFile(id);
        return {
            success: true,
            statusCode: 200,
            message: 'File deleted successfully',
        };
    }
}
