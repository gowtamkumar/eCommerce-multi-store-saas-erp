import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255 })
  storeName: string

  @Column({ type: 'varchar', length: 100, unique: true })
  subdomain: string

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  customDomain: string

  @Column({
    type: 'enum',
    enum: ['pending', 'verified', 'active'],
    default: 'pending',
  })
  customDomainStatus: string

  @Column({ type: 'timestamptz', nullable: true })
  customDomainVerifiedAt: Date

  @Column({
    type: 'enum',
    enum: ['basic', 'pro', 'enterprise'],
    default: 'basic',
  })
  planTier: string

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'archived'],
    default: 'active',
  })
  status: string

  @Column({ default: false })
  sslEnabled: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
