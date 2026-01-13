import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GlobalExceptionFilter } from './common/exception/exception-filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { FaqModule } from './modules/faq/faq.module';
import { FileModule } from './modules/file/file.module';
import { HomeModule } from './modules/home/home.module';
import { LeadModule } from './modules/lead/lead.module';
import { OrderModule } from './modules/order/order.module';
import { PageModule } from './modules/page/page.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ProductModule } from './modules/product/product.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ReviewModule } from './modules/review/review.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { TestimonialModule } from './modules/testimonial/testimonial.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/uploads',
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        'tenant/lookup',
        'tenants',
        'tenants/(.*)',
        'onboard',
        'admin/login',
        'auth/(.*)',
        'super-admin',
        'super-admin/(.*)',
        'settings',
        'home',
        'products',
        'products/(.*)',
      )
      .forRoutes('*');
  }
}

