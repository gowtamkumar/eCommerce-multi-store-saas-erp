import { GlobalExceptionFilter } from '@/common/exception/exception-filter'
import { BranchScopeGuard } from '@/common/guards/branch-scope.guard'
import { MaintenanceGuard } from '@/common/guards/maintenance.guard'
import { PermissionsGuard } from '@/common/guards/permissions.guard'
import { StoreIsolationGuard } from '@/common/guards/store-isolation.guard'
import { StoreStatusGuard } from '@/common/guards/store-status.guard'
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor'
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor'
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor'
import { StoreContextMiddleware } from '@/common/middleware/store-context.middleware'
import { DatabaseModule } from '@/database/database.module'
import { CatalogModule } from '@/modules/admin/catalog/catalog.module'
import { ContentModule } from '@/modules/admin/content/content.module'
import { AdminModule } from '@/modules/admin/core/admin.module'
import { AuthModule } from '@/modules/admin/core/auth/auth.module'
import { CustomerModule } from '@/modules/admin/customer/customer.module'
import { MarketingModule } from '@/modules/admin/marketing/marketing.module'
import { AiModule } from '@/modules/admin/ai/ai.module'
import { OperationsModule } from '@/modules/admin/operations/operations.module'
import { PaymentModule } from '@/modules/admin/sales/payment/payment.module'
import { SalesModule } from '@/modules/admin/sales/sales.module'
import { SettingsModule } from '@/modules/admin/settings/settings.module'
import { CartModule } from '@/modules/store/cart/cart.module'
import { StoreReturnModule } from '@/modules/store/return/store-return.module'
import { ShippingAddressModule } from '@/modules/store/shipping-address/shipping-address.module'
import { StoreWalletModule } from '@/modules/store/wallet/store-wallet.module'
import { WishlistModule } from '@/modules/store/wishlist/wishlist.module'
import { SystemModule } from '@/modules/system/system.module'
import { StoreModule } from '@/modules/system/store/store.module'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AppThrottlerModule } from '@/common/throttler/throttler.module'
import { CacheModule } from './modules/admin/operations/infra/cache/cache.module'
import { QueueModule } from './modules/admin/operations/infra/queue/queue.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development.local', '.env.development'],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    SettingsModule,
    CacheModule,

    // Core & System Domains (StoreModule before AdminModule — AuthModule depends on it)
    StoreModule,
    AdminModule,
    SystemModule,

    // Storefront Domain
    CartModule,
    ShippingAddressModule,
    WishlistModule,
    StoreWalletModule,
    StoreReturnModule,

    // Admin Sub-Domains
    CatalogModule,
    SalesModule,
    CustomerModule,
    ContentModule,
    MarketingModule,
    AiModule,
    OperationsModule,

    // Other Features
    AuthModule,
    PaymentModule,

    // Queue
    QueueModule,

    // Rate Limiting (Redis-backed global throttling)
    AppThrottlerModule,
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
      useClass: MaintenanceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: StoreIsolationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: StoreStatusGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BranchScopeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
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
      .apply(StoreContextMiddleware) //.exclude(...) → Skip Middleware for These Routes
      .exclude(
        '/',
        '',
        // 'store/lookup',
        'stores',
        'stores/*path',
        'onboard',
        'admin/login',
        'auth/*path',
        'super-admin',
        'super-admin/*path',
        'super-admin',
        'super-admin/*path',
        'audit-logs',
        'audit-logs/*path',
        'home',
        'categories',
        'categories/*path',
        'pages',
        'pages/*path',
        'products',
        'products/*path',
        'platform/settings',
        'platform/settings/*path',
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
        'subscribers',
        'subscribers/*path',
        'infra/notifications',
        'infra/notifications/*path',
        'courier/webhooks',
        'courier/webhooks/*path',
        'ai/mcp/*path',
      )
      .forRoutes('*path') // Apply Middleware for These Routes
  }
}
