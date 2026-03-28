import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LeadEntity } from '@/modules/admin/customer/lead/entities/lead.entity'
import { LeadController } from '@/modules/admin/customer/lead/lead.controller'
import { LeadService } from '@/modules/admin/customer/lead/lead.service'
import { LeadRepository } from './lead.repository'

@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity])],
  controllers: [LeadController],
  providers: [LeadService, LeadRepository],
  exports: [LeadService, LeadRepository],
})
export class LeadModule {}
