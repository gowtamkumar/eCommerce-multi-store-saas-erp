import Product from "@/features/product/components/Product";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <Product params={params} />
    );
}