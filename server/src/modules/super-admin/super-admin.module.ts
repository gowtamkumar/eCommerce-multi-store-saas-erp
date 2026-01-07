import { Module } from '@nestjs/common';
import { SuperAdminController } from './super-admin.controller';
import { UserModule } from '../admin/user/user.module';

@Module({
    imports: [UserModule],
    controllers: [SuperAdminController],
})
export class SuperAdminModule { }
