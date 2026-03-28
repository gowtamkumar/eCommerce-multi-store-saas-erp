import { LeadController } from '@/modules/admin/customer/lead/lead.controller'
import { LeadService } from '@/modules/admin/customer/lead/lead.service'
import { Module } from '@nestjs/common'
import { LeadRepository } from './lead.repository'

@Module({
  imports: [],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadModule {}
