import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from '@/modules/admin/lead/entities/lead.entity';
import { LeadController } from '@/modules/admin/lead/lead.controller';
import { LeadService } from '@/modules/admin/lead/lead.service';

@Module({
    imports: [TypeOrmModule.forFeature([LeadEntity])],
    controllers: [LeadController],
    providers: [LeadService],
    exports: [LeadService],
})
export class LeadModule { }
