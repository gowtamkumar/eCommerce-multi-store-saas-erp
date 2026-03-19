import Product from "@/features/admin/product/components/Product";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <Product params={params} />
    );
}