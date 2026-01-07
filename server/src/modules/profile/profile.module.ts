import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { UserModule } from '../admin/user/user.module';
import { OrderModule } from '../order/order.module';

@Module({
    imports: [UserModule, OrderModule],
    controllers: [ProfileController],
})
export class ProfileModule { }
