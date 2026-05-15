import { Injectable, Logger } from '@nestjs/common'
import { DataSource, EntityManager, MoreThan } from 'typeorm'
import { InventoryLedgerEntity } from '@/modules/admin/operations/logistics/inventory-transaction/entities/inventory-ledger.entity'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Injectable()
export class CogsService {
  private readonly logger = new Logger(CogsService.name)

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Calculates COGS using FIFO method by consuming remaining quantities of past purchase lots.
   * Updates 'remainingQuantity' on consumed lots.
   */
  async calculateAndConsumeCogs(
    productId: string,
    variantId: string | null,
    warehouseId: string,
    quantityToConsume: number,
    ctx: RequestContextDto,
    manager: EntityManager,
  ): Promise<number> {
    const tenantId = ctx.tenantId
    let remainingToProcess = Math.abs(quantityToConsume)
    let totalCogs = 0

    // 1. Find all available purchase/inbound lots for this product in this warehouse
    // Sorted by createdAt ASC (FIFO)
    const availableLots = await manager.find(InventoryLedgerEntity, {
      where: {
        productId,
        variantId: variantId || undefined,
        warehouseId,
        tenantId,
        remainingQuantity: MoreThan(0),
      },
      order: { createdAt: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    })

    for (const lot of availableLots) {
      if (remainingToProcess <= 0) break

      const lotAvailable = Number(lot.remainingQuantity)
      const toTake = Math.min(remainingToProcess, lotAvailable)

      totalCogs += toTake * Number(lot.unitCost || 0)
      
      // Update lot remaining quantity
      lot.remainingQuantity = lotAvailable - toTake
      await manager.save(lot)

      remainingToProcess -= toTake
    }

    if (remainingToProcess > 0) {
      this.logger.warn(
        `FIFO COGS: Oversold product ${productId}. Remaining quantity without cost: ${remainingToProcess}`,
      )
      // For oversold items, we use the last known cost if available, otherwise 0
      const lastLot = availableLots[availableLots.length - 1]
      if (lastLot) {
        totalCogs += remainingToProcess * Number(lastLot.unitCost || 0)
      }
    }

    return totalCogs
  }
}
