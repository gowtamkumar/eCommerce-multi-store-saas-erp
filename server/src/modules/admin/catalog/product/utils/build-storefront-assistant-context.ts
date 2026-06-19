import { FaqEntity } from '@/modules/admin/content/faq/entities/faq.entity'
import { CategoryEntity } from '@/modules/admin/catalog/category/entities/category.entity'
import { ProductEntity } from '../entities/product.entity'

function stripHtml(value?: string | null): string {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatProductLine(product: ProductEntity): string {
  const parts = [
    product.name,
    `(slug: ${product.slug})`,
    product.shortDescription ? stripHtml(product.shortDescription).slice(0, 160) : '',
    product.category?.name ? `category: ${product.category.name}` : '',
    product.brand?.name ? `brand: ${product.brand.name}` : '',
    `price: ${product.price}`,
    product.status ? `status: ${product.status}` : '',
  ].filter(Boolean)

  return `- ${parts.join(' | ')}`
}

export function buildStorefrontAssistantContext(input: {
  categories: CategoryEntity[]
  globalFaqs: FaqEntity[]
  matchedFaqs: FaqEntity[]
  matchedProducts: ProductEntity[]
  catalogProducts: ProductEntity[]
  brandName?: string
}): string {
  const categoryLines = input.categories.map((category) => `- ${category.name} (slug: ${category.slug})`)

  const faqMap = new Map<string, FaqEntity>()
  for (const faq of [...input.matchedFaqs, ...input.globalFaqs]) {
    faqMap.set(faq.id, faq)
  }
  const faqLines = [...faqMap.values()].slice(0, 25).map(
    (faq) => `Q: ${faq.question}\nA: ${stripHtml(faq.answer).slice(0, 400)}`,
  )

  const productMap = new Map<string, ProductEntity>()
  for (const product of [...input.matchedProducts, ...input.catalogProducts]) {
    productMap.set(product.id, product)
  }
  const productLines = [...productMap.values()].slice(0, 30).map(formatProductLine)

  const sections = [
    input.brandName ? `Store: ${input.brandName}` : '',
    categoryLines.length ? `Categories:\n${categoryLines.join('\n')}` : '',
    productLines.length ? `Catalog products (recommend only from this list):\n${productLines.join('\n')}` : '',
    faqLines.length ? `Store FAQs:\n${faqLines.join('\n\n')}` : '',
  ].filter(Boolean)

  return sections.join('\n\n')
}
