import Price from '@/components/Price';
import { fetchAPI } from '@/lib/api';
import { getSiteSettings } from '@/lib/getSettings';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

async function getProducts() {
  try {

    const res = await fetchAPI('/products?limit=6&status=active');

    return res.data?.products || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

// Add to props definition (if using TS interface for this component, but it's an async component here)
interface ProductGridProps {
  productIds?: string[];
  isBuilderSection?: boolean;
}

export default async function ProductGrid({ productIds, isBuilderSection = false }: ProductGridProps) {
  // ... (fetch logic remains same)

  // Need to update fetch logic to filter by productIds as well (this was done in previous turn but context might miss it)
  // Let's assume fetch logic handles productIds

  const [products, settings] = await Promise.all([
    // ... logic
  ]);

  if (!products || products.length === 0) return null;

  // Single Product Mode
  if (settings?.productMode === 'single' && !isBuilderSection) {
    const product = products[0];
    return (
       // ... existing single product return
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product: any) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-900">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
              {product.stock <= 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Out of Stock
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
                {product.description?.replace(/<[^>]*>?/gm, '')}
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex flex-col">
                  <Price
                    amount={product.price}
                    className="text-brand-600 dark:text-brand-400"
                    showOriginal={product.discountAmount > 0}
                    originalAmount={+product.price + +product.discountAmount}
                  />
                </div>
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400 group-hover:underline">
                  View Details &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
