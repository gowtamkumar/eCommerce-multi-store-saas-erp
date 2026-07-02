import { BadRequestException } from '@nestjs/common'

export function assertStoreContext(storeId: string | null | undefined): string {
  if (!storeId || storeId === 'null' || storeId === 'undefined') {
    throw new BadRequestException(
      'Store context missing. Open this store from its domain or send a valid x-store-id header.',
    )
  }

  return storeId
}
