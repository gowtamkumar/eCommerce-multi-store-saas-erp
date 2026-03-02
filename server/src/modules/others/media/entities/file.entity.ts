import { BaseEntity } from 'src/common/base-entity/BaseEntity'
import { Column, Entity } from 'typeorm'

@Entity('files')
export class FileEntity extends BaseEntity {
  @Column()
  fieldname: string // Photo, Signature, etc

  @Column({ nullable: true })
  originalname: string // Photo, Signature, etc

  @Column({ nullable: true })
  encoding: string

  @Column({ nullable: true })
  mimetype: string

  @Column({ nullable: true })
  destination: string

  @Column({ nullable: true })
  filename: string

  @Column({ name: 'pdf_file', nullable: true })
  pdfFile: string

  @Column({ nullable: true })
  path: string

  @Column({ nullable: true })
  size: number

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string
}
