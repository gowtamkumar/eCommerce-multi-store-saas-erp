import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { FulfillmentService } from './fulfillment.service'

@Processor('fulfillment')
export class FulfillmentProcessor extends WorkerHost {
  private readonly logger = new Logger(FulfillmentProcessor.name)

  constructor(private readonly fulfillmentService: FulfillmentService) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    const { payload, ctx } = job.data
    try {
      switch (job.name) {
        case 'create-fulfillment-task': {
          const { orderId } = payload
          this.logger.log(`Creating fulfillment task for order ${orderId}`)
          await this.fulfillmentService.createFromOrder(orderId, ctx)
          this.logger.log(`Successfully created fulfillment task for order ${orderId}`)
          return { success: true }
        }

        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }
}
