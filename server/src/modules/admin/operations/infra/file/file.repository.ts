import { BaseTenantRepository } from '@/common/base-repository'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FileEntity } from './entities/file.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class FileRepository extends BaseTenantRepository<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    repo: Repository<FileEntity>,
  ) {
    super(FileEntity, repo)
}

  async findAllByTenant(where: any): Promise<FileEntity[]> {
    return await this.repo.find({ where, order: { createdAt: 'DESC' } })
  }

  async findPaginatedByTenant(
    where: any,
    page: number,
    limit: number,
  ): Promise<[FileEntity[], number]> {
    return await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    })
  }

  async findById(id: string): Promise<FileEntity | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<FileEntity | null> {
    return await this.repo.findOne({ where: { id, tenantId } })
  }

  async createAndSave(dto: any, ctx: RequestContextDto): Promise<FileEntity> {
    const file = this.repo.create({
      ...dto,
      tenantId: ctx.tenantId,
      userId: ctx.userId,
    } as any) as unknown as FileEntity
    return await (this.repo.save(file) as Promise<FileEntity>)
  }

  async mergeAndSave(file: FileEntity, dto: any): Promise<FileEntity> {
    this.repo.merge(file, dto)
    return await (this.repo.save(file) as Promise<FileEntity>)
  }

  async removeFile(file: FileEntity): Promise<FileEntity> {
    return await this.repo.softRemove(file)
  }

  async getTotalStorageUsed(tenantId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('file')
      .select('SUM(file.size)', 'total')
      .where('file.tenantId = :tenantId', { tenantId })
      .getRawOne()
    return parseInt(result?.total || '0', 10)
  }
}
