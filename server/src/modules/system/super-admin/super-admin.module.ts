import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrafficInterceptor } from 'src/common/interceptors/traffic.interceptor';
import { UserModule } from 'src/modules/admin/core/user/user.module';
import { OrderModule } from 'src/modules/admin/order/order.module';
import { PageModule } from 'src/modules/admin/page/page.module';
import { ProductModule } from 'src/modules/admin/product/product.module';
import { ReviewModule } from 'src/modules/admin/review/review.module';
import { TenantModule } from 'src/modules/system/tenant/tenant.module';
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
