import ProductReviewPage from '@/features/product/admin/ProductReviewPage'

export default function page({ params }: { params: Promise<{ id: string }> }) {
    return (
        <ProductReviewPage params={params} />
    )
}