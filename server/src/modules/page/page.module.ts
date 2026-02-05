import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqModule } from '../faq/faq.module';
import { ProductModule } from '../product/product.module';
import { PageEntity } from './entities/page.entity';
import { PageController } from './page.controller';
import { PageService } from './page.service';

@Module({
    imports: [TypeOrmModule.forFeature([PageEntity]), ProductModule,
            FaqModule],
    controllers: [PageController],
    providers: [PageService],
    exports: [PageService],
})
export class PageModule { }
