import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common'
import { StockReservationService } from './stock-reservation.service'
import { ReservationStatus } from '@/common/enums/reservation-status.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'

@Controller('admin/inventory/reservations')
export class StockReservationController {
  constructor(private readonly reservationService: StockReservationService) {}

  /**
   * GET /admin/inventory/reservations?productId=&status=&page=&limit=
   * Paginated list of reservations for the current tenant.
   */
  @Get()
  async findAll(
    @RequestContext() ctx: RequestContextDto,
    @Query('productId') productId?: string,
    @Query('status') status?: ReservationStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reservationService.findAll(ctx.tenantId, {
      productId,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    })
  }

  /**
   * GET /admin/inventory/reservations/atp?productId=&variantId=&physicalBalance=
   * Returns the Available-to-Promise quantity for a product/variant.
   * physicalBalance must be provided by the caller (from the ledger).
   */
  @Get('atp')
  async getAtp(
    @RequestContext() ctx: RequestContextDto,
    @Query('productId') productId: string,
    @Query('variantId') variantId?: string,
    @Query('physicalBalance') physicalBalance?: string,
  ) {
    const physical = physicalBalance ? Number(physicalBalance) : 0
    const openReserved = await this.reservationService.getOpenReservedQty(
      productId,
      variantId ?? null,
      ctx.tenantId,
    )
    const atp = Math.max(0, physical - openReserved)
    return { productId, variantId: variantId ?? null, physicalBalance: physical, openReserved, atp }
  }

  /**
   * GET /admin/inventory/reservations/order/:orderId
   * All reservation rows linked to a specific order.
   */
  @Get('order/:orderId')
  async findByOrder(
    @RequestContext() ctx: RequestContextDto,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.reservationService.findByOrder(orderId, ctx.tenantId)
  }
}
