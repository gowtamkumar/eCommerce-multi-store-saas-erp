import { FileEntity } from '@/modules/admin/operations/infra/file/entities/file.entity'
import { FileRepository } from '@/modules/admin/operations/infra/file/file.repository'
import { OrderEntity } from '@/modules/admin/sales/order/entities/order.entity'
import { OrderRepository } from '@/modules/admin/sales/order/order.repository'
import { PaymentEntity } from '@/modules/admin/sales/payment/entities/payment.entity'
import { PaymentRepository } from '@/modules/admin/sales/payment/payment.repository'
import { SiteSettingsEntity } from '@/modules/admin/settings/entities/site-settings.entity'
import { SiteSettingsRepository } from '@/modules/admin/settings/site-settings.repository'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'
import { TenantRepository } from '@/modules/system/tenant/tenant.repository'
import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity, SiteSettingsEntity, FileEntity, OrderEntity, PaymentEntity])],
  providers: [TenantRepository, SiteSettingsRepository, FileRepository, OrderRepository, PaymentRepository],
  exports: [TenantRepository, SiteSettingsRepository, FileRepository, OrderRepository, PaymentRepository, TypeOrmModule],
})
export class PersistenceModule {}
