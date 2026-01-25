import { Module } from '@nestjs/common';
import { FaqModule } from '../faq/faq.module';
import { PageModule } from '../page/page.module';
import { ProductModule } from '../product/product.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
    imports: [
        ProductModule,
        FaqModule,
        PageModule,
    ],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule { }
