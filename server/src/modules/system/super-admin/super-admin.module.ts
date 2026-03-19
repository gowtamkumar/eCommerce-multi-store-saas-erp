import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficInterceptor } from '@/common/interceptors/traffic.interceptor';
import { UserModule } from '@/modules/admin/core/user/user.module';
import { OrderModule } from '@/modules/admin/sales/order/order.module';
import { PageModule } from '@/modules/admin/content/page/page.module';
import { ProductModule } from '@/modules/admin/catalog/product/product.module';
import { ReviewModule } from '@/modules/admin/catalog/review/review.module';
import { TenantModule } from '@/modules/system/tenant/tenant.module';
import { TenantTrafficEntity } from './entities/tenant-traffic.entity';
import { SuperAdminController } from './super-admin.controller';
import { TrafficService } from './traffic.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([TenantTrafficEntity]),
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
