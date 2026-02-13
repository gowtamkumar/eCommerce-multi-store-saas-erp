import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { GlobalExceptionFilter } from './common/exception/exception-filter'
import { TenantStatusGuard } from './common/guards/tenant-status.guard'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { TenantContextMiddleware } from './common/middleware/tenant-context.middleware'
import { DatabaseModule } from './database/database.module'
import { AdminModule } from './modules/admin/admin.module'
import { BrandModule } from './modules/brand/brand.module'
import { CacheModule } from './modules/cache/cache.module'
import { CartModule } from './modules/cart/cart.module'
import { CategoryModule } from './modules/category/category.module'
import { PathaoModule } from './modules/courier/pathao/pathao.module'
import { SteadfastModule } from './modules/courier/steadfast/steadfast.module'
import { FaqModule } from './modules/faq/faq.module'
import { FileModule } from './modules/file/file.module'
import { LeadModule } from './modules/lead/lead.module'
import { MailModule } from './modules/mail/mail.module'
import { OrderModule } from './modules/order/order.module'
import { PageModule } from './modules/page/page.module'
import { PaymentModule } from './modules/payment/payment.module'
import { PlatformModule } from './modules/platform/platform.module'
import { ProductModule } from './modules/product/product.module'
import { ReviewModule } from './modules/review/review.module'
import { SettingsModule } from './modules/settings/settings.module'
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module'
import { SuperAdminModule } from './modules/super-admin/super-admin.module'
import { TenantModule } from './modules/tenant/tenant.module'
import { TrackingModule } from './modules/tracking/tracking.module'

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
    FileModule,
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
    SuperAdminModule,
    MailModule,
    CategoryModule,
    CartModule,
    PlatformModule,
    TrackingModule,
    SubscriptionPlanModule,
    CacheModule,
    PathaoModule,
    SteadfastModule,
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
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware) //.exclude(...) → Skip Middleware for These Routes
      .exclude(
        'tenant/lookup',
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
        'uploads',
        'uploads/*path',
      )
      .forRoutes('*path') // Apply Middleware for These Routes
  }
}
