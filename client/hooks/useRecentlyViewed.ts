'use client';

import { useState, useEffect } from 'react';

export interface RecentProduct {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
    discountAmount?: number;
    discountType?: string;
    taxRate?: number;
    stock?: number;
    category?: { name: string };
    shortDescription?: string;
    description?: string;
}

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 20;

export const useRecentlyViewed = () => {
    const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setRecentProducts(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse recently viewed products', e);
            }
        }
    }, []);

    const addProduct = (product: RecentProduct) => {
        setRecentProducts((prev) => {
            // Remove if already exists (to move to front)
            const filtered = prev.filter((p) => p.id !== product.id);
            const updated = [product, ...filtered].slice(0, MAX_ITEMS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setRecentProducts([]);
    };

    return {
        recentProducts,
        addProduct,
        clearHistory,
    };
};
