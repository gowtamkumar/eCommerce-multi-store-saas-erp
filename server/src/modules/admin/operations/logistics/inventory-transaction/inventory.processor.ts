import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { Job } from 'bullmq'
import { DataSource } from 'typeorm'
import { StockReservationService } from './stock-reservation.service'
import { ProductBatchService } from './product-batch.service'
import { TenantEntity } from '@/modules/system/tenant/entities/tenant.entity'

@Processor('inventory')
export class InventoryProcessor extends WorkerHost {
  private readonly logger = new Logger(InventoryProcessor.name)

  constructor(
    private readonly stockReservationService: StockReservationService,
    private readonly productBatchService: ProductBatchService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`)
    try {
      switch (job.name) {
        case 'sweep-expired-reservations':
          this.logger.log('Starting automated sweep of expired active reservations...')
          const count = await this.stockReservationService.expireStale()
          return { expiredCount: count }
        case 'sweep-expired-batches':
          return await this.handleSweepExpiredBatches()
        default:
          this.logger.warn(`Unknown job name: ${job.name}`)
      }
    } catch (error: any) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack)
      throw error
    }
  }

  /**
   * Sweeps expired batches across every tenant and writes off any residual stock.
   * The actual transactional work runs inside ProductBatchService.markExpiredBatches.
   */
  async handleSweepExpiredBatches() {
    this.logger.log('Starting daily sweep of expired product batches...')
    const tenantRepo = this.dataSource.getRepository(TenantEntity)
    const tenants = await tenantRepo.find({
      select: {
        id: true,
      },
    })
    let totalAffected = 0
    for (const tenant of tenants) {
      try {
        const affected = await this.productBatchService.markExpiredBatches(tenant.id)
        if (affected > 0) {
          this.logger.log(`Tenant ${tenant.id}: marked ${affected} expired batch(es)`)
        }
        totalAffected += affected
      } catch (err: any) {
        this.logger.error(
          `Tenant ${tenant.id}: expired-batch sweep failed: ${err.message}`,
          err.stack,
        )
      }
    }
    this.logger.log(`Daily batch sweep finished. Total batches expired: ${totalAffected}`)
    return { totalAffected }
  }
}
