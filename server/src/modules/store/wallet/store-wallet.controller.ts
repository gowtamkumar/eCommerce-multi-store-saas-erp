import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { WalletService } from '@/modules/admin/operations/finance/accounting/services/wallet.service'
import { UnauthorizedException } from '@nestjs/common'

/**
 * Storefront wallet controller — exposes the wallet balance/history
 * to any authenticated storefront customer (JwtAuthGuard only, no admin permissions).
 *
 * Endpoint: GET /api/v1/store/wallet/me
 */
@UseGuards(JwtAuthGuard)
@Controller('store/wallet')
export class StoreWalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Returns the logged-in customer's wallet balance and transaction history.
   * Only returns data for the currently authenticated user (self-access only).
   */
  @Get('me')
  async getMyWallet(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    if (!ctx.userId) {
      throw new UnauthorizedException('You must be logged in to view your wallet')
    }

    const data = await this.walletService.getCustomerWalletSummary(ctx.userId, ctx.storeId)

    return {
      success: true,
      statusCode: 200,
      message: 'Wallet summary retrieved successfully',
      data,
    }
  }
}
