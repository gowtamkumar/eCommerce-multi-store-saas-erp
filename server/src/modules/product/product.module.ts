import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEntity } from './entities/product.entity';
import { ReviewModule } from '../review/review.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ProductEntity]),
        ReviewModule,
    ],
    controllers: [ProductController],
    providers: [ProductService],
    exports: [ProductService],
})
export class ProductModule { }
