import { Test, TestingModule } from '@nestjs/testing'
import { FilesService } from './file.service'
import { FileRepository } from '../file.repository'
import { MinioService } from './minio.service'
import { TenantService } from '@/modules/system/tenant/tenant.service'
import { DataSource } from 'typeorm'
import { BadRequestException } from '@nestjs/common'
import { GetPresignedUrlDto } from '../dtos'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { AddonCatalogService } from '@/modules/system/addon-catalog/addon-catalog.service'

describe('FilesService - Storage Limits', () => {
  let service: FilesService
  let fileRepo: jest.Mocked<FileRepository>
  let minioService: jest.Mocked<MinioService>
  let tenantService: jest.Mocked<TenantService>
  let addonCatalogService: jest.Mocked<AddonCatalogService>
  let dataSource: any

  beforeEach(async () => {
    fileRepo = {
      createAndSave: jest.fn(),
      getTotalStorageUsed: jest.fn(),
    } as any

    minioService = {
      getPresignedPutUrl: jest.fn(),
      getPublicUrl: jest.fn(),
    } as any

    tenantService = {
      findOneTenants: jest.fn(),
    } as any

    addonCatalogService = {
      getStorageAddons: jest.fn().mockResolvedValue([
        {
          slug: 'addon_storage_5gb',
          boostValue: 5 * 1024,
        },
      ]),
    } as any

    dataSource = {
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn(),
      }),
    } as any

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        { provide: FileRepository, useValue: fileRepo },
        { provide: MinioService, useValue: minioService },
        { provide: TenantService, useValue: tenantService },
        { provide: DataSource, useValue: dataSource },
        { provide: AddonCatalogService, useValue: addonCatalogService },
      ],
    }).compile()

    service = module.get<FilesService>(FilesService)
  })

  it('should block file upload if storage limit is exceeded', async () => {
    // Mock tenant with 1GB limit (1024 MB)
    tenantService.findOneTenants.mockResolvedValue({
      id: 'tenant-1',
      subscriptionPlan: {
        maxStorageMb: 1024,
      },
    } as any)

    // Mock no active addons
    const mockRepo = {
      find: jest.fn().mockResolvedValue([]),
    }
    dataSource.getRepository.mockReturnValue(mockRepo)

    // Mock 1GB total used storage (1024 * 1024 * 1024 bytes)
    const limitBytes = 1024 * 1024 * 1024
    fileRepo.getTotalStorageUsed.mockResolvedValue(limitBytes - 100) // 100 bytes left

    const dto: GetPresignedUrlDto = {
      filename: 'test.png',
      mimetype: 'image/png',
      size: 150, // requested 150 bytes (exceeds remaining 100 bytes)
    }

    const ctx: RequestContextDto = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      user: {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'ADMIN',
      } as any,
    }

    await expect(service.generatePresignedUpload(dto, ctx)).rejects.toThrow(BadRequestException)
  })

  it('should allow file upload if storage limit is not exceeded', async () => {
    // Mock tenant with 1GB limit (1024 MB)
    tenantService.findOneTenants.mockResolvedValue({
      id: 'tenant-1',
      subscriptionPlan: {
        maxStorageMb: 1024,
      },
    } as any)

    // Mock active 5GB addon
    const mockRepo = {
      find: jest.fn().mockResolvedValue([{ featureSlug: 'addon_storage_5gb', isEnabled: true }]),
    }
    dataSource.getRepository.mockReturnValue(mockRepo)

    // Mock 1GB total used storage
    const limitBytes = 1024 * 1024 * 1024
    fileRepo.getTotalStorageUsed.mockResolvedValue(limitBytes) // 1GB used, but limit is 6GB due to 5GB addon

    minioService.getPresignedPutUrl.mockResolvedValue('http://mock-upload-url')
    minioService.getPublicUrl.mockReturnValue('http://mock-public-url')
    fileRepo.createAndSave.mockResolvedValue({ id: 'file-1' } as any)

    const dto: GetPresignedUrlDto = {
      filename: 'test.png',
      mimetype: 'image/png',
      size: 1000,
    }

    const ctx: RequestContextDto = {
      tenantId: 'tenant-1',
      userId: 'user-1',
      user: {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: 'ADMIN',
      } as any,
    }

    const result = await service.generatePresignedUpload(dto, ctx)
    expect(result.uploadUrl).toBe('http://mock-upload-url')
    expect(result.downloadUrl).toBe('http://mock-public-url')
  })
})
