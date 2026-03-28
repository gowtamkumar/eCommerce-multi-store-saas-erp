import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { GlobalExceptionFilter } from '@/common/exception/exception-filter'
import { TenantStatusGuard } from '@/common/guards/tenant-status.guard'
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor'
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor'
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor'
import { TenantContextMiddleware } from '@/common/middleware/tenant-context.middleware'
import { DatabaseModule } from '@/database/database.module'
import { PersistenceModule } from '@/database/persistence.module'
import { AdminModule } from '@/modules/admin/core/admin.module'
import { CatalogModule } from '@/modules/admin/catalog/catalog.module'
import { SalesModule } from '@/modules/admin/sales/sales.module'
import { CustomerModule } from '@/modules/admin/customer/customer.module'
import { ContentModule } from '@/modules/admin/content/content.module'
import { OperationsModule } from '@/modules/admin/operations/operations.module'
import { CartModule } from '@/modules/store/cart/cart.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { SystemModule } from '@/modules/system/system.module'
import { TenantModule } from '@/modules/system/tenant/tenant.module'
import { AuthModule } from '@/modules/admin/core/auth/auth.module'
import { SeoModule } from '@/modules/store/seo/seo.module'
import { ShippingAddressModule } from '@/modules/store/shipping-address/shipping-address.module'

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
    DatabaseModule,
    PersistenceModule,

    // Core & System Domains
    AdminModule,
    SystemModule,
    TenantModule,

    // Storefront Domain
    CartModule,
    ShippingAddressModule,

    // Admin Sub-Domains
    CatalogModule,
    SalesModule,
    CustomerModule,
    ContentModule,
    OperationsModule,
    SettingsModule,

    // Other Features
    AuthModule,
    PaymentModule,
    SeoModule,
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
        'suppliers',
        'suppliers/*path',
        'purchase-orders',
        'purchase-orders/*path',
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
