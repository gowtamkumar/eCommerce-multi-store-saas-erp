import Products from '@/features/product/shop/Products'

export default async function page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  return (
    <Products searchParams={resolvedParams} />
  )
}