import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import {
  isTenantAiProviderReady,
  normalizeStorefrontAiConfig,
} from '@/common/utils/storefront-ai-config.util'
import { TenantAiClientService } from '@/modules/admin/ai/services/tenant-ai-client.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class StorefrontAiConfigService {
  constructor(
    private readonly tenantAiClient: TenantAiClientService,
    private readonly permissionResolution: PermissionResolutionService,
  ) {}

  async isPlanAiEnabled(tenantId: string): Promise<boolean> {
    return this.permissionResolution.isFeatureEnabledForTenant(tenantId, 'ai')
  }

  async getProviderConfig(tenantId: string) {
    return this.tenantAiClient.getConfigForTenant(tenantId)
  }

  async isProviderReady(tenantId: string): Promise<boolean> {
    if (!(await this.isPlanAiEnabled(tenantId))) {
      return false
    }

    try {
      const config = await this.getProviderConfig(tenantId)
      return isTenantAiProviderReady(config)
    } catch {
      return false
    }
  }

  async getStorefrontFlags(tenantId: string) {
    try {
      const config = await this.getProviderConfig(tenantId)
      return normalizeStorefrontAiConfig(config.storefront)
    } catch {
      return normalizeStorefrontAiConfig(null)
    }
  }
}
