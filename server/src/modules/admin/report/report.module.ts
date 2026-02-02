import { Module } from '@nestjs/common';
import { OrderModule } from '../../order/order.module';
import { PageModule } from '../../page/page.module';
import { ProductModule } from '../../product/product.module';
import { SuperAdminModule } from '../../super-admin/super-admin.module';
import { UserModule } from '../user/user.module';
import { ReportController } from './report.controller';

@Module({
    imports: [
        SuperAdminModule,
        UserModule,
        ProductModule,
        OrderModule,
        PageModule
    ],
    controllers: [ReportController],
})
export class AnalyticsModule { }
