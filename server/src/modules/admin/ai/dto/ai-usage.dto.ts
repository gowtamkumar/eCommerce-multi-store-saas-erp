export interface RecordAiUsageParams {
  tenantId: string
  endpoint: string
  operation: 'chat' | 'embedding'
  model: string
  promptTokens?: number
  completionTokens?: number
  totalTokens: number
  jobId?: string | null
}

export interface AiUsageSummaryDto {
  days: number
  totalTokens: number
  totalRequests: number
  byOperation: Array<{
    operation: string
    totalTokens: number
    requestCount: number
  }>
  byEndpoint: Array<{
    endpoint: string
    totalTokens: number
    requestCount: number
  }>
  byDay: Array<{
    date: string
    totalTokens: number
    requestCount: number
  }>
}
