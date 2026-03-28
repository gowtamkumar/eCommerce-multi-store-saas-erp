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

  getFiles(filterFile: FilterFileDto, tenantId: string): Promise<FileEntity[]> {
    this.logger.log(`${this.getFiles.name} Service Called`)
    const { filename, originalname } = filterFile

    const newQuery: any = { tenantId }

    if (filename) newQuery.filename = filename
    if (originalname) newQuery.originalname = originalname
    return this.fileRepository.findAllByTenant(newQuery)
  }

  async getFile(id: string) {
    this.logger.log(`${this.getFile.name} Service Called`)
    const file = await this.fileRepository.findById(id)

    if (!file) {
      throw new NotFoundException(`File of id ${id} not found`)
    }

    return file
  }

  async createFile(createFile: CreateFileDto, tenantId: string) {
    this.logger.log(`${this.createFile.name} Service Called`)
    return this.fileRepository.createAndSave(createFile, tenantId)
  }

  async createPdf(createFile: CreateFileDto) {
    this.logger.log(`${this.createPdf.name} Service Called`)

    const pdf = new PDFDocument()
    const filename = `example_${Date.now()}.pdf`
    const filePath = `public/uploads/${filename}`

    // Create and save the PDF
    pdf.pipe(fs.createWriteStream(filePath))
    pdf.text('Hello, World! kkkd dkjasdklfa sd kljlkj lk j kljlkjkl')
    pdf.end()

    return this.fileRepository.createAndSave({
      pdfFile: filename,
      fieldname: filename,
    })
  }

  async updateFile(id: string, updateFile: UpdateFileDto) {
    this.logger.log(`${this.updateFile.name} Service Called`)

    const findFile = await this.fileRepository.findById(id)

    if (!findFile) {
      throw new NotFoundException(`File of id ${id} not found`)
    }
    return this.fileRepository.mergeAndSave(findFile, updateFile)
  }

  async deleteFile(id: string, tenantId: string) {
    this.logger.log(`${this.deleteFile.name} Service Called`)
    const file = await this.fileRepository.findByIdAndTenant(id, tenantId)

    if (!file) {
      throw new NotFoundException(`File of id ${id} not found`)
    }

    return this.fileRepository.removeFile(file)
  }
}
