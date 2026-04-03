import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { FileEntity } from './entities/file.entity'

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(FileEntity)
    private readonly repo: Repository<FileEntity>,
  ) { }

  async findAllByTenant(where: any): Promise<FileEntity[]> {
    return await this.repo.find({ where })
  }

  async findById(id: string): Promise<FileEntity | null> {
    return await this.repo.findOne({ where: { id } })
  }

  async findByIdAndTenant(id: string, tenantId: string): Promise<FileEntity | null> {
    return await this.repo.findOne({ where: { id, tenantId } })
  }

  async createAndSave(dto: any, tenantId?: string): Promise<FileEntity> {
    const file = this.repo.create({ ...dto, tenantId } as any) as unknown as FileEntity
    return await (this.repo.save(file) as Promise<FileEntity>)
  }

  async mergeAndSave(file: FileEntity, dto: any): Promise<FileEntity> {
    this.repo.merge(file, dto)
    return await (this.repo.save(file) as Promise<FileEntity>)
  }

  async removeFile(file: FileEntity): Promise<FileEntity> {
    return await this.repo.softRemove(file)
  }
}
