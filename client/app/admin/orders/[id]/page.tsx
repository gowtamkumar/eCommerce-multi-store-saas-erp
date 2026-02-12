import OrderDetailsPage from '@/features/order/components/OrderDetailsPage'

export default function page({ params }: { params: Promise<{ id: string; }> }) {
  return (
    <OrderDetailsPage params={params} />
  )
}