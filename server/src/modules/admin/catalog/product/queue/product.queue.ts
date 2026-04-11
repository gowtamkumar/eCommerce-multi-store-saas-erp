import { InjectQueue } from "@nestjs/bullmq"
import { Injectable } from "@nestjs/common"
import { Queue } from "bullmq"

@Injectable()
export class ProductQueue {
    constructor(@InjectQueue('product') private queue: Queue) { }

    async createPO(data: any, tenantId: string) {
        return this.queue.add('create-po', { ...data, tenantId })
    }

    async updateStock(data: any, tenantId: string) {
        return this.queue.add('update-stock', { ...data, tenantId })
    }
}