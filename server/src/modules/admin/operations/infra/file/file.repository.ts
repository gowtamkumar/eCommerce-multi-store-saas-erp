import { Injectable } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { FileEntity } from './entities/file.entity'

@Injectable()
export class FileRepository extends Repository<FileEntity> {
  constructor(private dataSource: DataSource) {
    super(FileEntity, dataSource.createEntityManager())
  }

  async findAllByTenant(where: any): Promise<FileEntity[]> {
    return await this.find({ where })
  }

  async findById(id: string): Promise<FileEntity | null> {
    return await this.findOne({ where: { id } })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<FileEntity | null> {
    return await this.findOne({ where: { id, tenantId } })
  }

  async createAndSave(dto: any, tenantId?: string): Promise<FileEntity> {
    const file = this.create({ ...dto, tenantId } as any) as unknown as FileEntity
    return await (this.save(file) as Promise<FileEntity>)
  }

  async mergeAndSave(file: FileEntity, dto: any): Promise<FileEntity> {
    this.merge(file, dto)
    return await (this.save(file) as Promise<FileEntity>)
  }

  async removeFile(file: FileEntity): Promise<FileEntity> {
    return await this.remove(file)
  }
}
