import ProductReviewPage from '@/features/admin/product/components/ProductReviewPage'

export default function page({ params }: { params: Promise<{ id: string }> }) {
    return (
        <ProductReviewPage params={params} />
    )
}