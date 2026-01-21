import Price from '@/components/Price';
import { fetchAPI } from '@/lib/api';
import { getSiteSettings } from '@/lib/getSettings';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import ProductCard from './ProductCard';

async function getProducts() {
  try {

    const res = await fetchAPI('/products?limit=6&status=active');

    return res.data?.products || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

interface ProductGridProps {
  productIds?: string[];
  isBuilderSection?: boolean;
}

export default async function ProductGrid({ productIds, isBuilderSection = false }: ProductGridProps) {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSiteSettings()
  ]);

  if (!products || products.length === 0) {
    return null;
  }

  // Single Product Mode
  if (settings?.productMode === 'single' && !isBuilderSection) {
    const product = products[0];
    return (
      <div className="py-12 container mx-auto px-4">
        <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative aspect-square md:aspect-auto bg-slate-100 dark:bg-slate-900">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
            </div>

            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider w-fit mb-6">
                New Arrival
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 font-display">
                {product.name}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed line-clamp-4">
                {product.description?.replace(/<[^>]*>?/gm, '')}
              </p>

              <div className="flex items-center gap-6 mb-10">
                <Price
                  amount={product.price}
                  className="text-4xl text-slate-900 dark:text-white"
                  showOriginal={product.discountAmount > 0}
                  originalAmount={+product.price + +product.discountAmount}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/products/${product.slug}`}
                  className="px-8 py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </Link>
                <Link
                  href={`/products/${product.slug}`}
                  className="px-8 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  View Details
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multiple Product Mode (Grid)
  const containerClasses = isBuilderSection ? 'w-full' : 'py-12';

  return (
    <div className={containerClasses}>
      {!isBuilderSection && (
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white font-display">
          Our Latest Products
        </h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
