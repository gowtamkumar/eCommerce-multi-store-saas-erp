/**
 * Lightweight runtime checks for shared list-hook helpers.
 * Run manually with: npx tsx client/hooks/useApiList.test.ts
 */
import assert from 'node:assert/strict'

function defaultParseResponse(res: Record<string, unknown>, page: number, pageSize: number) {
  const data = res.data
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = data as { orders?: unknown[]; pagination?: unknown }
    if (Array.isArray(nested.orders)) {
      return {
        items: nested.orders,
        pagination: nested.pagination ?? {
          total: nested.orders.length,
          page,
          limit: pageSize,
          totalPages: 1,
        },
      }
    }
  }
  const items = Array.isArray(data) ? data : []
  return {
    items,
    pagination: (res.pagination as object | undefined) ?? {
      total: items.length,
      page,
      limit: pageSize,
      totalPages: 1,
    },
  }
}

const nested = defaultParseResponse(
  { data: { orders: [{ id: '1' }], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } } },
  1,
  10,
)
assert.equal(nested.items.length, 1)

const flat = defaultParseResponse({ data: [{ id: 'a' }, { id: 'b' }] }, 1, 10)
assert.equal(flat.items.length, 2)
assert.equal((flat.pagination as { total: number }).total, 2)

console.log('useApiList parser checks passed')
