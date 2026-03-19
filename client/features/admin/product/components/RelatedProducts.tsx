'use client';

import ProductCard from '@/features/product/components/ProductCard';
import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Product, RelatedProductsProps } from '../types';


export default function RelatedProducts({ currentProductId }: RelatedProductsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { settings } = useSettings();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch products excluding the current one, limit to user preference
                const limit = settings?.singleProductPage?.relatedProductsPerRow || 4;
                const data = await fetchAPI(`/products?exclude=${currentProductId}&limit=${limit}&status=active`);
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

                <div className={`grid grid-cols-1 sm:grid-cols-2 ${
                    {
                        2: 'lg:grid-cols-2',
                        3: 'lg:grid-cols-3',
                        4: 'lg:grid-cols-4',
                        5: 'lg:grid-cols-5',
                        6: 'lg:grid-cols-6',
                    }[settings?.singleProductPage?.relatedProductsPerRow || 4] || 'lg:grid-cols-4'
                } gap-8`}>
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="h-full"
                        >
                            <ProductCard product={product} />
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
