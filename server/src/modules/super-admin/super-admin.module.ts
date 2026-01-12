import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { UserModule } from '../admin/user/user.module';
import { TenantModule } from '../tenant/tenant.module';
import { OrderModule } from '../order/order.module';
import { ReviewModule } from '../review/review.module';

@Module({
    imports: [UserModule, TenantModule, OrderModule, ReviewModule],
    controllers: [SuperAdminController],
})
export class SuperAdminModule { }
