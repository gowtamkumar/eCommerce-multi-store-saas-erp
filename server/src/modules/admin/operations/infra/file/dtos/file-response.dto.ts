import { Expose } from 'class-transformer'

export class FileResponseDto {
  @Expose()
  id: string

  @Expose()
  fieldname: string

  @Expose()
  originalname: string

  @Expose()
  encoding: string

  @Expose()
  mimetype: string

  @Expose()
  destination: string

  @Expose()
  filename: string

  @Expose()
  pdfFile: string

  @Expose()
  path: string

  @Expose()
  size: number

  @Expose()
  tenantId: string

  @Expose()
  userId: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date
}
