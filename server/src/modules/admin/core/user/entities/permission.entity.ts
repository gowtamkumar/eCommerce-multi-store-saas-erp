import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm'

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  @Index({ unique: true })
  code: string

  @Column()
  name: string

  @Column({ nullable: true })
  description: string

  @Column()
  module: string
}
