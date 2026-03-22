'use client';

import { useEffect } from 'react';
import { useRecentlyViewed, RecentProduct } from '@/hooks/useRecentlyViewed';

interface TrackRecentlyViewedProps {
    product: any;
}

export default function TrackRecentlyViewed({ product }: TrackRecentlyViewedProps) {
    const { addProduct } = useRecentlyViewed();

    useEffect(() => {
        if (product) {
            const recentProduct: RecentProduct = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                images: product.images || [],
                price: product.price,
                discountAmount: product.discountAmount,
                discountType: product.discountType,
                taxRate: product.taxRate,
                stock: product.stock,
                category: product.category,
                shortDescription: product.shortDescription,
                description: product.description,
            };
            addProduct(recentProduct);
        }
    }, [product, addProduct]);

    return null;
}
