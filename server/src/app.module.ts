import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { DatabaseModule } from './database/database.module';
import { FileModule } from './modules/file/file.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { FaqModule } from './modules/faq/faq.module';
import { ReviewModule } from './modules/review/review.module';
import { TestimonialModule } from './modules/testimonial/testimonial.module';
import { LeadModule } from './modules/lead/lead.module';
import { PageModule } from './modules/page/page.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PaymentModule } from './modules/payment/payment.module';
import { HomeModule } from './modules/home/home.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/exception/exception-filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development'],
    }),
    AdminModule,
    DatabaseModule,
    FileModule,
    TenantModule,
    ProductModule,
    OrderModule,
    FaqModule,
    ReviewModule,
    TestimonialModule,
    LeadModule,
    PageModule,
    SettingsModule,
    PaymentModule,
    HomeModule,
    ProfileModule,
    SuperAdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }

