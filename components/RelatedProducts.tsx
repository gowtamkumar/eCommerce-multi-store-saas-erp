'use client';

import Price from '@/components/Price';
import { useSettings } from '@/contexts/SettingsContext';
import { fetchAPI } from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Product {
    id: string;
    _id: string;
    name: string;
    price: number;
    images: string[];
    tagline?: string;
    discountAmount?: number;
    slug: string;
}

interface RelatedProductsProps {
    currentProductId: string;
}

export default function RelatedProducts({ currentProductId }: RelatedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { settings } = useSettings();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products excluding the current one, limit to 3
                const data = await fetchAPI(`/products?exclude=${currentProductId}&limit=3&status=active`);
                if (data.success && data.data?.products) {
                    setProducts(data.data.products);
                }
            } catch (error) {
                console.error('Error fetching related products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentProductId]);

    if (loading || products.length === 0) return null;

    return (
        <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                            You May Also Like
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Discover more premium products from our collection
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="hidden md:flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:gap-3 transition-all"
                    >
                        View All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group"
                        >
                            <Link href={`/products/${product.slug}`} className="block">
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-4">
                                    <Image
                                        src={product.images[0] || 'https://via.placeholder.com/400'}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                    <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <span className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-lg font-medium text-sm">
                                            <ShoppingBag className="w-4 h-4" />
                                            View Product
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                    {product.name}
                                </h3>
                                {product.tagline && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                        {product.tagline}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                    <Price
                                        amount={product.price}
                                        className="text-slate-900 dark:text-white"
                                        showOriginal={product.discountAmount !== undefined && product.discountAmount > 0}
                                        originalAmount={product.price + (product.discountAmount || 0)}
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        View All Products <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
