import { Audit } from '@/common/decorators/audit.decorator'
import { RequestContext } from '@/common/decorators/request-context.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { BaseApiSuccessResponse } from '@/common/dto/base-api-response.dto'
import { RequestContextDto } from '@/common/dto/request-context.dto'
import { SystemPermissions } from '@/common/enums/user/permissions.enum'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
// import { Throttle } from '@nestjs/throttler'
import { plainToInstance } from 'class-transformer'
import { CreateStoreDto } from './dto/create-store.dto'
import { StoreLookupDto } from './dto/store-lookup.dto'
import { UpdateCustomDomainDto } from './dto/update-custom-domain.dto'
import {
  StoreAiConfigResponseDto,
  TestStoreAiConfigDto,
  UpdateStoreAiConfigDto,
} from './dto/store-ai-config.dto'
import { StoreResponseDto } from './dto/store-response.dto'
import { StoreEntity } from './entities/store.entity'
import { CreateStoreResponseDto, StoreService } from './store.service'
import { StoreAiClientService } from '@/modules/admin/ai/services/store-ai-client.service'
import { SubscriptionGuard } from '@/common/guards/subscription.guard'
import { RequireFeature } from '@/common/decorators/require-feature.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { ModuleRef } from '@nestjs/core'

/**
 * Convert a raw StoreEntity (which can carry internal/sensitive columns and
 * unloaded relations) into the safe response shape we ship over the wire.
 * `excludeExtraneousValues: true` ensures only `@Expose()`-ed fields on
 * StoreResponseDto are emitted, so a new sensitive column added to the
 * entity in the future cannot accidentally leak.
 */
function toStoreResponse(store: StoreEntity): StoreResponseDto {
  return plainToInstance(StoreResponseDto, store, {
    excludeExtraneousValues: true,
  })
}

/**
 * Public-facing store shape (storefront lookup by subdomain/custom domain).
 * Unauthenticated callers must never see per-domain verification tokens — they
 * are only meaningful to the store admin proving DNS ownership, so we strip
 * them here while keeping them on the authenticated `/stores/info` response.
 */
function toPublicStoreResponse(store: StoreEntity): StoreResponseDto {
  const dto = toStoreResponse(store)
  if (Array.isArray(dto.domains)) {
    dto.domains = dto.domains.map((d) => ({ ...d, verificationToken: null }))
  }
  return dto
}

@Controller('stores')
export class StoreController {
  private readonly logger = new Logger(StoreController.name)
  constructor(
    private readonly storeService: StoreService,
    private readonly moduleRef: ModuleRef,
  ) {}

  @Public()
  @Post()
  async create(
    @Body() createStoreDto: CreateStoreDto,
  ): Promise<BaseApiSuccessResponse<CreateStoreResponseDto>> {
    this.logger.log(`create`)
    const data = await this.storeService.createStore(createStoreDto)
    return {
      success: true,
      statusCode: 201,
      message: 'Store created successfully',
      data,
    }
  }

  @Public()
  @Get()
  async findAll(
    @Query() query: StoreLookupDto,
  ): Promise<BaseApiSuccessResponse<StoreResponseDto[] | StoreResponseDto>> {
    if (query.subdomain || query.customDomain) {
      const findDomain = await this.storeService.lookupStore(query.subdomain, query.customDomain)
      return {
        success: true,
        statusCode: 200,
        message: 'Store lookup successful',
        data: toPublicStoreResponse(findDomain),
      }
    }

    const stores = await this.storeService.findAllStores()
    return {
      success: true,
      statusCode: 200,
      message: 'Stores retrieved successfully',
      data: stores.map(toPublicStoreResponse),
    }
  }

  @Public()
  @Get('check-domain')
  async checkDomain(@Query('domain') domain: string): Promise<void> {
    if (!domain) {
      throw new BadRequestException('Domain query parameter is required')
    }
    const store = await this.storeService.findByCustomDomain(domain)
    if (store) {
      return // 200 OK
    }
    throw new NotFoundException('Domain is not active or registered')
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Get('info')
  async getStoreInfo(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<StoreResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called getStoreInfo.`)
    const store = await this.storeService.findOneStores(ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'Store info retrieved successfully',
      data: toStoreResponse(store),
    }
  }

  // ───────────────────────────── Custom domain management ─────────────────
  // All custom-domain endpoints are store-scoped and require an explicit
  // SETTINGS_MANAGE permission. Anything that mutates the store's domain is
  // audited and never auto-marks the domain as ACTIVE — that only happens
  // after a successful TXT verification.

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  // @Throttle({ transactional: { limit: 10, ttl: 60000 } })
  @Patch('custom-domain')
  @Audit({ entity: 'Store', action: 'CUSTOM_DOMAIN_REQUEST' })
  async updateCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: UpdateCustomDomainDto,
  ): Promise<BaseApiSuccessResponse<StoreResponseDto & { verificationInstructions: any }>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called updateCustomDomain.`)
    const result = await this.storeService.requestCustomDomain(ctx.storeId, body.customDomain)
    return {
      success: true,
      statusCode: 200,
      message:
        'Custom domain saved. Add the supplied DNS TXT record then call /stores/custom-domain/verify.',
      data: {
        ...toStoreResponse(result),
        verificationInstructions: result.verificationInstructions,
      },
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('custom-domain/verify/:domainId')
  @Audit({ entity: 'Store', action: 'CUSTOM_DOMAIN_VERIFY' })
  async verifyCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Param('domainId') domainId: string,
  ): Promise<BaseApiSuccessResponse<StoreResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called verifyCustomDomain.`)
    const store = await this.storeService.verifyCustomDomain(ctx.storeId, domainId)
    return {
      success: true,
      statusCode: 200,
      message: 'Custom domain verified successfully',
      data: toStoreResponse(store),
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Delete('custom-domain/:domainId')
  @Audit({ entity: 'Store', action: 'CUSTOM_DOMAIN_DETACH' })
  async detachCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Param('domainId') domainId: string,
  ): Promise<BaseApiSuccessResponse<StoreResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called detachCustomDomain.`)
    const store = await this.storeService.detachCustomDomain(ctx.storeId, domainId)
    return {
      success: true,
      statusCode: 200,
      message: 'Custom domain removed',
      data: toStoreResponse(store),
    }
  }

  @UseGuards(JwtAuthGuard)
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Patch('custom-domain/primary/:domainId')
  @Audit({ entity: 'Store', action: 'CUSTOM_DOMAIN_PRIMARY' })
  async setPrimaryCustomDomain(
    @RequestContext() ctx: RequestContextDto,
    @Param('domainId') domainId: string,
  ): Promise<BaseApiSuccessResponse<StoreResponseDto>> {
    this.logger.verbose(`User "${ctx.user?.username || 'System'}" called setPrimaryCustomDomain.`)
    const store = await this.storeService.setPrimaryCustomDomain(ctx.storeId, domainId)
    return {
      success: true,
      statusCode: 200,
      message: 'Primary custom domain set successfully',
      data: toStoreResponse(store),
    }
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature('settings')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Get('ai-config')
  async getAiConfig(
    @RequestContext() ctx: RequestContextDto,
  ): Promise<BaseApiSuccessResponse<StoreAiConfigResponseDto>> {
    const data = await this.storeService.getStoreAiConfig(ctx.storeId)
    return {
      success: true,
      statusCode: 200,
      message: 'AI configuration retrieved successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature('settings')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  @Patch('ai-config')
  @Audit({ entity: 'Store', action: 'AI_CONFIG_UPDATE' })
  async updateAiConfig(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: UpdateStoreAiConfigDto,
  ): Promise<BaseApiSuccessResponse<StoreAiConfigResponseDto>> {
    const data = await this.storeService.updateStoreAiConfig(ctx.storeId, body)
    return {
      success: true,
      statusCode: 200,
      message: 'AI configuration updated successfully',
      data,
    }
  }

  @UseGuards(JwtAuthGuard, SubscriptionGuard)
  @RequireFeature('settings')
  @RequirePermissions(SystemPermissions.SETTINGS_MANAGE)
  // @Throttle({ sensitive: { limit: 5, ttl: 60000 } })
  @Post('ai-config/test')
  @HttpCode(200)
  async testAiConfig(
    @RequestContext() ctx: RequestContextDto,
    @Body() body: TestStoreAiConfigDto,
  ): Promise<BaseApiSuccessResponse<{ reply: string; model: string; totalTokens: number }>> {
    const storeAiClientService = this.moduleRef.get(StoreAiClientService, { strict: false })
    const result = await storeAiClientService.testConnection(
      ctx.storeId,
      body.prompt || 'Reply with exactly: OK',
    )
    return {
      success: true,
      statusCode: 200,
      message: 'AI connection successful',
      data: {
        reply: result.content,
        model: result.model,
        totalTokens: result.totalTokens,
      },
    }
  }
}
