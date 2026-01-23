import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { SuperAdminModule } from '../super-admin/super-admin.module';

@Module({
    imports: [SuperAdminModule],
    controllers: [TrackingController],
})
export class TrackingModule { }
