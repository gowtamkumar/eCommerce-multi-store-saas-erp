import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
            },
        }),
    ],
    exports: [BullModule],
})
export class QueueModule { }