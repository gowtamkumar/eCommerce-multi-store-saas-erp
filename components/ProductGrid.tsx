import { getSiteSettings } from '@/lib/getSettings';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api';
import { resolveTenantId } from '@/lib/server-utils';

async function getProducts() {
  try {
    const tenantId = await resolveTenantId();

    if (!tenantId) {
      console.error("No tenant context for products grid");
      return [];
    }

    const res = await fetchAPI('/products?limit=6&status=active', {
      headers: {
        "x-tenant-id": tenantId,
      },
      next: { revalidate: 60 } // Optional: Cache for 60 seconds
    });

    return res.data?.products || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductGrid() {
  const [products, settings] = await Promise.all([
    getProducts(),
    getSiteSettings()
  ]);

  if (!products || products.length === 0) {
    return null;
  }

  // Single Product Mode
  if (settings?.productMode === 'single') {
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
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  ${(product.price)}
                </span>
                {product.discountAmount > 0 && (
                  <span className="text-xl text-slate-400 line-through">
                    ${(+product.price + +product.discountAmount)}
                  </span>
                )}
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
  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white font-display">
        Our Latest Products
      </h2>
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
                  {product.discountAmount > 0 && (
                    <span className="text-sm text-slate-400 line-through">
                      ${(product.price + product.discountAmount).toFixed(2)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-brand-600 dark:text-brand-400">
                    ${product.price.toFixed(2)}
                  </span>
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
