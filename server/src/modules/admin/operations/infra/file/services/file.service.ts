import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as fs from 'fs'
import PDFDocument from 'pdfkit'
import { FileEntity } from '../entities/file.entity'
import { CreateFileDto, FilterFileDto, UpdateFileDto } from '../dtos'
import { FileRepository } from '../file.repository'

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name)

  constructor(private readonly fileRepository: FileRepository) {}

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
      totalPages: Math.ceil(total / limit)
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

  async createFile(createFile: CreateFileDto, tenantId: string, userId?: string): Promise<FileEntity> {
    this.logger.log(`${this.createFile.name} Service Called`)
    return this.fileRepository.createAndSave(createFile, tenantId, userId)
  }

  async createPdf(createFile: CreateFileDto): Promise<FileEntity> {
    this.logger.log(`${this.createPdf.name} Service Called`)

    const pdf = new PDFDocument()
    const filename = `example_${Date.now()}.pdf`
    const filePath = `public/uploads/${filename}`

    // Create and save the PDF
    pdf.pipe(fs.createWriteStream(filePath))
    pdf.text('Hello, World! kkkd dkjasdklfa sd kljlkj lk j kljlkjkl')
    pdf.end()

    return this.fileRepository.createAndSave(
      {
        pdfFile: filename,
        fieldname: filename,
      } as any,
      'system',
    )
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
