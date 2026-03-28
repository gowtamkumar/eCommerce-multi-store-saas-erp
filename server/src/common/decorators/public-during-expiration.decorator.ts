import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_DURING_EXPIRATION_KEY = 'isPublicDuringExpiration'
export const PublicDuringExpiration = () => SetMetadata(IS_PUBLIC_DURING_EXPIRATION_KEY, true)
