import { Controller, Get, Post, Body, UseGuards, Query, Res } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionBillingService } from './subscription-billing.service'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { PublicDuringExpiration } from '@/common/decorators/public-during-expiration.decorator'
import { Public } from '../../../common/decorators/public.decorator'

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class SubscriptionBillingController {
  constructor(private readonly billingService: SubscriptionBillingService) { }

  @Get('current')
  @PublicDuringExpiration()
  async getCurrentSubscription(@RequestContext() ctx: RequestContextDto) {
    return await this.billingService.getCurrentSubscription(ctx.tenantId)
  }

  @Get('plans')
  @PublicDuringExpiration()
  async getAvailablePlans() {
    return await this.billingService.getAvailablePlans()
  }

  @Get('history')
  @PublicDuringExpiration()
  async getBillingHistory(@RequestContext() ctx: RequestContextDto) {
    return await this.billingService.getBillingHistory(ctx.tenantId)
  }

  @Post('initiate')
  @PublicDuringExpiration()
  async initiatePayment(
    @RequestContext() ctx: RequestContextDto,
    @Body('planId') planId: string
  ) {
    return await this.billingService.initiateSubscriptionPayment(ctx.tenantId, planId)
  }

  @Get('complete')
  @Public() // Allow public access for callback
  async completePayment(@Query('txn') transactionId: string, @Res() res: any) {
    await this.billingService.completeSubscriptionPayment(transactionId)
    // Redirect back to billing page
    return res.redirect('/admin/settings/billing?success=true')
  }
}
