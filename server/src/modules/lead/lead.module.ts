import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from './entities/lead.entity';
import { LeadController } from './lead.controller';
import { LeadService } from './lead.service';

@Module({
    imports: [TypeOrmModule.forFeature([LeadEntity])],
    controllers: [LeadController],
    providers: [LeadService],
    exports: [LeadService],
})
export class LeadModule { }
