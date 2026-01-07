import Link from 'next/link';

async function getProducts() {
  try {
    const dbConnect = (await import('@/lib/mongodb')).default;
    const { getTenantId } = await import('@/lib/tenant');
    const Product = (await import('@/models/Product')).default;

    await dbConnect();
    const tenantId = await getTenantId();

    if (!tenantId) {
      console.error("No tenant context for products grid");
      return [];
    }

    const products = await Product.find({ status: "active", tenantId } as any)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function ProductGrid() {
  const products = await getProducts();

  if (!products || products.length === 0) {
    return null; // Don't render anything if no products
  }

  return (
    <div className="py-12">
      <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white font-display">
        Our Latest Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product: any) => (
          <Link
            key={product._id}
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
