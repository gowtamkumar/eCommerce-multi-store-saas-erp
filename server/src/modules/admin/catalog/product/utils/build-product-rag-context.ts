import { ProductStatus } from '@/common/enums/product-status.enum'
import { ProductEntity } from '../entities/product.entity'

function stripHtml(value?: string | null): string {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function buildProductRagContext(product: ProductEntity): string {
  const attributeLines = (product.attributes || []).map(
    (attribute) => `- ${attribute.name}: ${(attribute.values || []).join(', ')}`,
  )

  const variantLines = (product.variants || []).map((variant) => {
    const combination = variant.combination
      ? Object.entries(variant.combination)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ')
      : 'default'
    const stockLabel =
      variant.stock === undefined || variant.stock === null
        ? 'stock unknown'
        : variant.stock > 0
          ? `in stock (${variant.stock})`
          : 'out of stock'
    const priceLabel =
      variant.price !== undefined && variant.price !== null
        ? `price ${variant.price}`
        : 'uses base price'
    return `- ${combination} — ${priceLabel}, ${stockLabel}${variant.sku ? `, SKU ${variant.sku}` : ''}`
  })

  const faqLines = (product.faqs || []).map(
    (faq) => `Q: ${faq.question}\nA: ${stripHtml(faq.answer)}`,
  )

  const reviewLines = (product.reviews || [])
    .slice(0, 5)
    .map((review) => `- ${review.rating}/5: ${stripHtml(review.comment).slice(0, 200)}`)

  const sections = [
    `Product: ${product.name}`,
    product.shortDescription ? `Short description: ${stripHtml(product.shortDescription)}` : '',
    product.description ? `Description: ${stripHtml(product.description).slice(0, 3000)}` : '',
    product.category?.name ? `Category: ${product.category.name}` : '',
    product.brand?.name ? `Brand: ${product.brand.name}` : '',
    product.sku ? `SKU: ${product.sku}` : '',
    product.barcode ? `Barcode: ${product.barcode}` : '',
    `Product type: ${product.productType}`,
    `Status: ${product.status}`,
    `List price: ${product.price}`,
    product.discountAmount
      ? `Discount: ${product.discountAmount} (${product.discountType || 'fixed'})`
      : '',
    product.taxRate ? `Tax rate: ${product.taxRate}%` : '',
    product.stock !== undefined ? `Stock (simple product): ${product.stock}` : '',
    attributeLines.length ? `Attributes:\n${attributeLines.join('\n')}` : '',
    variantLines.length ? `Variants:\n${variantLines.join('\n')}` : '',
    faqLines.length ? `Product FAQs:\n${faqLines.join('\n\n')}` : '',
    reviewLines.length ? `Recent reviews:\n${reviewLines.join('\n')}` : '',
    product.metaTitle ? `SEO title: ${product.metaTitle}` : '',
    product.metaDescription ? `SEO description: ${product.metaDescription}` : '',
  ].filter(Boolean)

  return sections.join('\n')
}

export function isProductEligibleForStorefrontQa(product: ProductEntity): boolean {
  return product.status === ProductStatus.ACTIVE
}
