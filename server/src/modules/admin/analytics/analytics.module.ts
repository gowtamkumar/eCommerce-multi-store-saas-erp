import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { SuperAdminModule } from '../../super-admin/super-admin.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../../product/product.module';
import { OrderModule } from '../../order/order.module';
import { PageModule } from '../../page/page.module';

@Module({
    imports: [
        SuperAdminModule,
        UserModule,
        ProductModule,
        OrderModule,
        PageModule
    ],
    controllers: [AnalyticsController],
})
export class AnalyticsModule { }
