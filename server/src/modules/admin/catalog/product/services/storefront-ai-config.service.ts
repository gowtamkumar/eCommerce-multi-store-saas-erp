import { PermissionResolutionService } from '@/common/services/permission-resolution.service'
import {
  isStoreAiProviderReady,
  normalizeStorefrontAiConfig,
} from '@/common/utils/storefront-ai-config.util'
import { StoreAiClientService } from '@/modules/admin/ai/services/store-ai-client.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class StorefrontAiConfigService {
  constructor(
    private readonly storeAiClient: StoreAiClientService,
    private readonly permissionResolution: PermissionResolutionService,
  ) {}

  async isPlanAiEnabled(storeId: string): Promise<boolean> {
    return this.permissionResolution.isFeatureEnabledForStore(storeId, 'ai')
  }

  async getProviderConfig(storeId: string) {
    return this.storeAiClient.getConfigForStore(storeId)
  }

  async isProviderReady(storeId: string): Promise<boolean> {
    if (!(await this.isPlanAiEnabled(storeId))) {
      return false
    }

    try {
      const config = await this.getProviderConfig(storeId)
      return isStoreAiProviderReady(config)
    } catch {
      return false
    }
  }

  async getStorefrontFlags(storeId: string) {
    try {
      const config = await this.getProviderConfig(storeId)
      return normalizeStorefrontAiConfig(config.storefront)
    } catch {
      return normalizeStorefrontAiConfig(null)
    }
  }
}
