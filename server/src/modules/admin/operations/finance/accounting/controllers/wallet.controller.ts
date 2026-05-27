import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { WalletService } from '../services/wallet.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { WalletTransactionType } from '@/common/enums/wallet-transaction-type.enum'
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

class ManualWalletCreditDto {
  @IsUUID()
  customerId: string

  @IsNumber()
  @Min(0.01)
  amount: number

  @IsOptional()
  @IsString()
  note?: string
}

class ManualWalletDebitDto {
  @IsUUID()
  customerId: string

  @IsNumber()
  @Min(0.01)
  amount: number

  @IsOptional()
  @IsString()
  note?: string
}

@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequireFeature('finance')
@Controller('finance/wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * GET /api/v1/finance/wallet/:customerId
   * Returns current balance + full history for a customer (admin view).
   */
  @Get(':customerId')
  @RequirePermissions(SystemPermissions.ACCOUNTING_READ)
  async getCustomerWallet(
    @Param('customerId') customerId: string,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.walletService.getCustomerWalletSummary(customerId, ctx.tenantId)
    return {
      success: true,
      statusCode: 200,
      message: 'Customer wallet summary retrieved successfully',
      data,
    }
  }

  /**
   * POST /api/v1/finance/wallet/credit
   * Admin manually credits a customer wallet (top-up / goodwill credit).
   */
  @Post('credit')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async manualCredit(
    @Body() body: ManualWalletCreditDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.walletService.creditWallet(
      {
        customerId: body.customerId,
        amount: body.amount,
        type: WalletTransactionType.MANUAL_CREDIT,
        referenceType: 'MANUAL',
        note: body.note || 'Admin manual credit',
        createdBy: ctx.userId,
      },
      ctx,
    )
    return {
      success: true,
      statusCode: 201,
      message: 'Wallet credited successfully',
      data,
    }
  }

  /**
   * POST /api/v1/finance/wallet/debit
   * Admin manually debits a customer wallet (correction / adjustment).
   */
  @Post('debit')
  @RequirePermissions(SystemPermissions.ACCOUNTING_WRITE)
  async manualDebit(
    @Body() body: ManualWalletDebitDto,
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<any>> {
    const data = await this.walletService.debitWallet(
      {
        customerId: body.customerId,
        amount: body.amount,
        referenceType: 'MANUAL',
        note: body.note || 'Admin manual debit',
      },
      ctx,
    )
    return {
      success: true,
      statusCode: 201,
      message: 'Wallet debited successfully',
      data,
    }
  }
}
