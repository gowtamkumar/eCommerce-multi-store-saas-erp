import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SuperAdminController } from './super-admin.controller';
import { UserModule } from '../admin/user/user.module';
import { TenantModule } from '../tenant/tenant.module';
import { OrderModule } from '../order/order.module';
import { ReviewModule } from '../review/review.module';
import { ProductModule } from '../product/product.module';
import { PageModule } from '../page/page.module';
import { TrafficService } from './traffic.service';
import { TenantTrafficEntity } from './entities/tenant-traffic.entity';
import { PageTrafficEntity } from './entities/page-traffic.entity';
import { TrafficInterceptor } from '../../common/interceptors/traffic.interceptor';

@Module({
    imports: [
        TypeOrmModule.forFeature([TenantTrafficEntity, PageTrafficEntity]),
        UserModule,
        TenantModule,
        OrderModule,
        ReviewModule,
        ProductModule,
        PageModule
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
