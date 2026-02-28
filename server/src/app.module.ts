import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { GlobalExceptionFilter } from './common/exception/exception-filter'
import { TenantStatusGuard } from './common/guards/tenant-status.guard'
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware'
import { DatabaseModule } from './database/database.module'
import { AdminModule } from './modules/admin/admin.module'
import { BrandModule } from './modules/brand/brand.module'
import { CartModule } from './modules/cart/cart.module'
import { CategoryModule } from './modules/category/category.module'
import { FaqModule } from './modules/faq/faq.module'
import { LeadModule } from './modules/lead/lead.module'
import { OrderModule } from './modules/order/order.module'
import { OthersModule } from './modules/others/others.module'
import { PageModule } from './modules/page/page.module'
import { PaymentModule } from './modules/payment/payment.module'
import { ProductModule } from './modules/product/product.module'
import { ReviewModule } from './modules/review/review.module'
import { SettingsModule } from './modules/settings/settings.module'
import { SubscriberModule } from './modules/subscriber/subscriber.module'
import { AuditLogModule } from './modules/system-platform/audit-log/audit-log.module'
import { SystemPlatformModule } from './modules/system-platform/system-platform.module'
import { TenantModule } from './modules/tenant/tenant.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development'],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public/uploads'),
      serveRoot: '/uploads',
    }),
    AdminModule,
    DatabaseModule,
    TenantModule,
    BrandModule,
    ProductModule,
    OrderModule,
    FaqModule,
    ReviewModule,
    LeadModule,
    PageModule,
    SettingsModule,
    PaymentModule,
    CategoryModule,
    CartModule,
    OthersModule,
    SubscriberModule,
    AuditLogModule,
    SystemPlatformModule,
  ],
  controllers: [],
  providers: [
    // Global Providers
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: TenantStatusGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
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
      .apply(TenantContextMiddleware) //.exclude(...) → Skip Middleware for These Routes
      .exclude(
        // 'tenant/lookup',
        'tenants',
        'tenants/*path',
        'onboard',
        'admin/login',
        'auth/*path',
        'super-admin',
        'super-admin/*path',
        'settings',
        'home',
        'categories',
        'categories/*path',
        'pages',
        'pages/*path',
        'products',
        'products/*path',
        'platform/settings',
        'plans',
        'plans/*path',
        'brands',
        'brands/*path',
        'admin/media',
        'admin/media/*path',
        'uploads',
        'uploads/*path',
        'subscribers',
        'subscribers/*path',
      )
      .forRoutes('*path') // Apply Middleware for These Routes
  }
}
