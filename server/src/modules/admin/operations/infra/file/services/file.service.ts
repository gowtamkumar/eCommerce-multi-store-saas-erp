import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { CreateFileDto, FilterFileDto, GetPresignedUrlDto, UpdateFileDto } from '../dtos'
import { FileEntity } from '../entities/file.entity'
import { FileRepository } from '../file.repository'
import { MinioService } from './minio.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { DataSource } from 'typeorm'
import { TenantFeatureEntity } from '@/modules/system/tenant/entities/tenant-feature.entity'

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name)

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly minioService: MinioService,
    private readonly tenantService: TenantService,
    private readonly dataSource: DataSource,
  ) {}


  async generatePresignedUpload(dto: GetPresignedUrlDto, ctx: RequestContextDto) {
    this.logger.log(`${this.generatePresignedUpload.name} Service Called`)
    const { filename, mimetype, size } = dto
    const tenantId = ctx.tenantId || 'system'

    if (tenantId !== 'system') {
      const tenant = await this.tenantService.findOneTenants(tenantId)
      if (tenant) {
        const baseLimitMb = tenant.subscriptionPlan?.maxStorageMb ?? 1024 // default 1GB
        if (baseLimitMb !== -1) { // -1 represents unlimited
          let addonsMb = 0
          const activeOverrides = await this.dataSource.getRepository(TenantFeatureEntity).find({
            where: { tenantId, isEnabled: true },
          })
          for (const override of activeOverrides) {
            if (override.featureSlug === 'addon_storage_5gb') {
              addonsMb += 5 * 1024
            } else if (override.featureSlug === 'addon_storage_10gb') {
              addonsMb += 10 * 1024
            } else if (override.featureSlug === 'addon_storage_20gb') {
              addonsMb += 20 * 1024
            }
          }

          const totalLimitBytes = (baseLimitMb + addonsMb) * 1024 * 1024
          const totalUsedBytes = await this.fileRepository.getTotalStorageUsed(tenantId)

          if (totalUsedBytes + size > totalLimitBytes) {
            throw new BadRequestException(
              `Storage limit exceeded. Remaining storage: ${Math.max(0, totalLimitBytes - totalUsedBytes)} bytes. Requested upload size: ${size} bytes.`,
            )
          }
        }
      }
    }

    // Generate a unique object key inside MinIO
    const uniqueId = randomUUID()
    const objectKey = `${tenantId}/uploads/${uniqueId}_${filename}`

    // Get the presigned URL and download URL from MinioService
    const uploadUrl = await this.minioService.getPresignedPutUrl(objectKey)
    const downloadUrl = this.minioService.getPublicUrl(objectKey)

    // Save metadata in database
    const fileEntity = await this.fileRepository.createAndSave(
      {
        fieldname: 'file',
        originalname: filename,
        filename: `${uniqueId}_${filename}`,
        mimetype,
        size,
        path: downloadUrl,
        destination: `${tenantId}/uploads`,
      },
      ctx,
    )

    return {
      uploadUrl,
      downloadUrl,
      file: fileEntity,
    }
  }

  async getFiles(filterFile: FilterFileDto, tenantId: string): Promise<any> {
    this.logger.log(`${this.getFiles.name} Service Called`)
    const { filename, originalname, page = 1, limit = 20 } = filterFile

    const newQuery: any = { tenantId }

    if (filename) newQuery.filename = filename
    if (originalname) newQuery.originalname = originalname

    // If a query explicitly wants all (e.g. limit=0 or undefined historically but we enforce defaults now)
    // Actually, we enforce pagination for scalability
    const [items, total] = await this.fileRepository.findPaginatedByTenant(newQuery, page, limit)

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getFile(id: string): Promise<FileEntity> {
    this.logger.log(`${this.getFile.name} Service Called`)
    const file = await this.fileRepository.findById(id)

    if (!file) {
      throw new NotFoundException(`File of id ${id} not found`)
    }

    return file
  }

  async createFile(createFile: CreateFileDto, ctx: RequestContextDto): Promise<FileEntity> {
    this.logger.log(`${this.createFile.name} Service Called`)
    return this.fileRepository.createAndSave(createFile, ctx)
  }

  async updateFile(id: string, updateFile: UpdateFileDto): Promise<FileEntity> {
    this.logger.log(`${this.updateFile.name} Service Called`)

    const findFile = await this.fileRepository.findById(id)

    if (!findFile) {
      throw new NotFoundException(`File of id ${id} not found`)
    }
    return this.fileRepository.mergeAndSave(findFile, updateFile)
  }

  async deleteFile(id: string, tenantId: string): Promise<FileEntity> {
    this.logger.log(`${this.deleteFile.name} Service Called`)
    const file = await this.fileRepository.findByIdAndTenant(id, tenantId)

    if (!file) {
      throw new NotFoundException(`File of id ${id} not found`)
    }

    return this.fileRepository.removeFile(file)
  }
}
