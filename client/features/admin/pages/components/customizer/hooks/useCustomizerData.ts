"use client";

import { fetchAPI } from '@/services/api';
import { FAQItem, ReviewItem } from '@/types/customizer';
import { useEffect, useState, useMemo } from 'react';

export function useCustomizerData() {
  const [categories, setCategories] = useState<any[]>([]);
  const [dbReviews, setDbReviews] = useState<any[]>([]);
  const [dbFaqs, setDbFaqs] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, revRes, faqRes, prodRes, brandRes] = await Promise.all([
          fetchAPI('/categories'),
          fetchAPI('/reviews/public'),
          fetchAPI('/faqs?limit=100'),
          fetchAPI('/products?limit=100'),
          fetchAPI('/brands')
        ]);

        if (catRes.success) setCategories(catRes.data);
        if (revRes.data) {
          setDbReviews(revRes.data.map((r: any) => ({
            id: r.id || r._id,
            author: r.customerName,
            text: r.comment,
            rating: r.rating
          })));
        }
        if (faqRes.success && faqRes.data?.faqs) setDbFaqs(faqRes.data.faqs);
        if (prodRes.success && prodRes.data?.products) setProducts(prodRes.data.products);
        if (brandRes.success) setBrands(brandRes.data);
      } catch (error) {
        console.error("Failed to load customizer data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return useMemo(() => ({
    categories,
    dbReviews,
    dbFaqs,
    products,
    brands,
    loading
  }), [categories, dbReviews, dbFaqs, products, brands, loading]);
}
