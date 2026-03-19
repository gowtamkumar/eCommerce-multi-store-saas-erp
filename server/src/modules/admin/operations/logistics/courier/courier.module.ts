import { Module } from '@nestjs/common';
import { PathaoModule } from './pathao/pathao.module';
import { SteadfastModule } from './steadfast/steadfast.module';

@Module({
    imports: [PathaoModule, SteadfastModule],
    exports: [PathaoModule, SteadfastModule],
})
export class CourierModule { }
