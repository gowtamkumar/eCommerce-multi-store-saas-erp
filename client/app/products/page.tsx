import Products from '@/features/product/components/Products'

export default function page({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <Products searchParams={searchParams} />
  )
}