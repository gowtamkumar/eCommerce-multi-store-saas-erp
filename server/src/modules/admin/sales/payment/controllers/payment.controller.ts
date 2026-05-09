import { RequestContext } from '@/common/decorators/request-context.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PaginationDto } from '@/common/dto/pagination.dto'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { Controller, Get, Logger, Query, UseGuards } from '@nestjs/common'
import { PaymentService } from '../services/payment.service'

@Controller('payments')
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('/admin/payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name)

  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async findAllPayments(
    @RequestContext() ctx: RequestContextDto,
    @Query() filterDto: PaginationDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called findAllPayments.`)
    const result = await this.paymentService.findAllPayments(ctx, filterDto)
    return {
      success: true,
      statusCode: 200,
      message: 'Payments retrieved successfully',
      data: result,
    }
  }
}
