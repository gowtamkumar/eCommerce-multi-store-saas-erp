import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestimonialController } from './testimonial.controller';
import { TestimonialService } from './testimonial.service';
import { TestimonialEntity } from './entities/testimonial.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TestimonialEntity])],
    controllers: [TestimonialController],
    providers: [TestimonialService],
    exports: [TestimonialService],
})
export class TestimonialModule { }
