import { RequestContextDto } from '@/common/dto/request-context.dto'
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { CreateFileDto, FilterFileDto, GetPresignedUrlDto, UpdateFileDto } from '../dtos'
import { FileEntity } from '../entities/file.entity'
import { FileRepository } from '../file.repository'
import { MinioService } from './minio.service'
import { StoreService } from '@/modules/system/store/store.service'
import { DataSource, ILike } from 'typeorm'
import { StoreFeatureEntity } from '@/modules/system/store/entities/store-feature.entity'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name)

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly minioService: MinioService,
    private readonly storeService: StoreService,
    private readonly dataSource: DataSource,
    private readonly addonCatalogService: AddonCatalogService,
  ) {}

  async generatePresignedUpload(dto: GetPresignedUrlDto, ctx: RequestContextDto) {
    this.logger.log(`${this.generatePresignedUpload.name} Service Called`)
    const { filename, mimetype, size } = dto
    const storeId = ctx.storeId || 'system'

    if (storeId !== 'system') {
      const store = await this.storeService.findOneStores(storeId)
      if (store) {
        const baseLimitMb = store.subscriptionPlan?.maxStorageMb ?? 1024 // default 1GB
        if (baseLimitMb !== -1) {
          // -1 represents unlimited
          let addonsMb = 0
          const activeOverrides = await this.dataSource.getRepository(StoreFeatureEntity).find({
            where: { storeId, isEnabled: true },
          })
          // Load storage addon definitions from DB dynamically
          const storageAddonDefs = await this.addonCatalogService.getStorageAddons()
          for (const override of activeOverrides) {
            for (const def of storageAddonDefs) {
              if (
                override.featureSlug === def.slug ||
                override.featureSlug.startsWith(def.slug + '_')
              ) {
                addonsMb += def.boostValue
                break
              }
            }
          }

          const totalLimitBytes = (baseLimitMb + addonsMb) * 1024 * 1024
          const totalUsedBytes = await this.fileRepository.getTotalStorageUsed(storeId)

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
    const objectKey = `${storeId}/uploads/${uniqueId}_${filename}`

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
        destination: `${storeId}/uploads`,
      },
      ctx,
    )

    return {
      uploadUrl,
      downloadUrl,
      file: fileEntity,
    }
  }

  async getFiles(filterFile: FilterFileDto, storeId: string): Promise<any> {
    this.logger.log(`${this.getFiles.name} Service Called`)
    const { filename, originalname, q, page = 1, limit = 20 } = filterFile

    // Free-text search matches the human-friendly originalname as well as the
    // stored filename (which is prefixed with a unique id), using partial match.
    const search = q ?? filename ?? originalname

    let where: any = { storeId }
    if (search) {
      where = [
        { storeId, originalname: ILike(`%${search}%`) },
        { storeId, filename: ILike(`%${search}%`) },
      ]
    }

    const [items, total] = await this.fileRepository.findPaginatedByStore(where, page, limit)

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

  async deleteFile(id: string, storeId: string): Promise<FileEntity> {
    this.logger.log(`${this.deleteFile.name} Service Called`)
    const file = await this.fileRepository.findByIdAndStore(id, storeId)

    if (!file) {
      throw new NotFoundException(`File of id ${id} not found`)
    }

    return this.fileRepository.removeFile(file)
  }
}
