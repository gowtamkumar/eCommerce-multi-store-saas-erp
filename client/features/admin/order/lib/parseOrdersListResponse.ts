import type { Order } from '@/types/order';
import type { OrderListPagination } from '../type';

export function parseOrdersListResponse(
  res: Record<string, unknown>,
  page: number,
  limit: number,
): { items: Order[]; pagination: OrderListPagination } {
  const data = res.data as { orders?: Order[]; pagination?: OrderListPagination } | Order[] | undefined;
  if (data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.orders)) {
    return {
      items: data.orders,
      pagination: data.pagination ?? {
        total: data.orders.length,
        page,
        limit,
        totalPages: 1,
      },
    };
  }
  const items = Array.isArray(data) ? data : [];
  return {
    items,
    pagination: (res.pagination as OrderListPagination | undefined) ?? {
      total: items.length,
      page,
      limit,
      totalPages: 1,
    },
  };
}
