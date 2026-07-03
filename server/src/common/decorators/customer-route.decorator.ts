import { SetMetadata } from '@nestjs/common'

/** Storefront routes accessible to customers (UserRole.USER) as well as staff. */
export const CUSTOMER_ROUTE_KEY = 'customerRoute'
export const CustomerRoute = () => SetMetadata(CUSTOMER_ROUTE_KEY, true)
