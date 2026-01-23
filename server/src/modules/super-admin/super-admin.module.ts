import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SuperAdminController } from './super-admin.controller';
import { UserModule } from '../admin/user/user.module';
import { TenantModule } from '../tenant/tenant.module';
import { OrderModule } from '../order/order.module';
import { ReviewModule } from '../review/review.module';
import { TrafficService } from './traffic.service';
import { TenantTrafficEntity } from './entities/tenant-traffic.entity';
import { TrafficInterceptor } from '../../common/interceptors/traffic.interceptor';

@Module({
    imports: [
        TypeOrmModule.forFeature([TenantTrafficEntity]),
        UserModule,
        TenantModule,
        OrderModule,
        ReviewModule
    ],
    controllers: [SuperAdminController],
    providers: [
        TrafficService,
        {
            provide: APP_INTERCEPTOR,
            useClass: TrafficInterceptor,
        },
    ],
    exports: [TrafficService],
})
export class SuperAdminModule { }
