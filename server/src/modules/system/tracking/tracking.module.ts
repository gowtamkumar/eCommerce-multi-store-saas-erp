import { Module } from '@nestjs/common';
import { SuperAdminModule } from '../super-admin/super-admin.module';
import { TrackingController } from './tracking.controller';

@Module({
    imports: [SuperAdminModule],
    controllers: [TrackingController],
})
export class TrackingModule { }
