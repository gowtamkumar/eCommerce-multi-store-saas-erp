import { Expose } from 'class-transformer'

export class BaseApiSuccessResponse<T> {
  @Expose()
  success: boolean

  @Expose()
  statusCode: number

  @Expose()
  message: string

  @Expose()
  data: T

  @Expose()
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }

  constructor(partial: Partial<BaseApiSuccessResponse<T>>) {
    Object.assign(this, partial)
  }
}
