import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { ProductModule } from '../product/product.module';
import { TestimonialModule } from '../testimonial/testimonial.module';
import { FaqModule } from '../faq/faq.module';
import { PageModule } from '../page/page.module';

@Module({
    imports: [
        ProductModule,
        TestimonialModule,
        FaqModule,
        PageModule,
    ],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule { }
