import { InjectQueue } from "@nestjs/bullmq"
import { Injectable } from "@nestjs/common"
import { Queue } from "bullmq"

@Injectable()
export class ProductQueue {
    constructor(@InjectQueue('product') private queue: Queue) { }

    async createPO(data: any, tenantId: string) {
        console.log('add create po job:', data);
        return this.queue.add('create-po', { ...data, tenantId })
    }

    async updateStock(data: any, tenantId: string) {
        console.log('add update stock job:', data);
        return this.queue.add('update-stock', { ...data, tenantId })
    }
}