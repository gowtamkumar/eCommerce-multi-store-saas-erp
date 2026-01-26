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
import { CartModule } from './modules/cart/cart.module'
import { CategoryModule } from './modules/category/category.module'
import { FaqModule } from './modules/faq/faq.module'
import { FileModule } from './modules/file/file.module'
import { HomeModule } from './modules/home/home.module'
import { LeadModule } from './modules/lead/lead.module'
import { MailModule } from './modules/mail/mail.module'
import { OrderModule } from './modules/order/order.module'
import { PageModule } from './modules/page/page.module'
import { PaymentModule } from './modules/payment/payment.module'
import { ProductModule } from './modules/product/product.module'
import { ProfileModule } from './modules/profile/profile.module'
import { ReviewModule } from './modules/review/review.module'
import { SettingsModule } from './modules/settings/settings.module'
import { SubscriptionPlanModule } from './modules/subscription-plan/subscription-plan.module'
import { SuperAdminModule } from './modules/super-admin/super-admin.module'
import { TenantModule } from './modules/tenant/tenant.module'
import { TrackingModule } from './modules/tracking/tracking.module'
import { WishlistModule } from './modules/wishlist/wishlist.module'

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
    LeadModule,
    PageModule,
    SettingsModule,
    PaymentModule,
    HomeModule,
    ProfileModule,
    SuperAdminModule,
    MailModule,
    CategoryModule,
    CartModule,
    WishlistModule,
    TrackingModule,
    SubscriptionPlanModule,
  ],
  controllers: [],
  providers: [
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
        'categories',
        'categories/(.*)',
        'pages',
        'pages/(.*)',
        'products',
        'products/(.*)',
      )
      .forRoutes('*')
  }
}
