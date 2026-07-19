'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Product, ProductVariant } from './useBatchRegistry';

/** Generates a unique batch number like BATCH-PARACE-20260719-A3F2 */
function generateBatchNumber(product: Product): string {
  const prefix = product.name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BATCH-${prefix}-${date}-${rand}`;
}

export function useCreateBatch(isOpen: boolean, onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Form Fields
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [initialQuantity, setInitialQuantity] = useState<number>(0);

  const fetchProducts = useCallback(async (query: string) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50', includeVariants: 'true' });
      if (query.trim()) params.set('q', query.trim());
      const res = await fetchAPI(`/products?${params.toString()}`);
      if (res.success) {
        // API response: { success: true, data: { products: Product[], total: N }, pagination: {...} }
        // The controller sets `data: products` where `products` is from service's `{ products, total }`
        const list = res.data?.products ?? (Array.isArray(res.data) ? res.data : []);
        setProducts(list);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Initial load when modal opens
  useEffect(() => {
    if (!isOpen) return;
    void fetchProducts('');
  }, [fetchProducts, isOpen]);

  // Debounced server-side search — re-fetch on query change
  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      void fetchProducts(searchQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [fetchProducts, isOpen, searchQuery]);

  // Auto-generate batch number when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      setBatchNumber(generateBatchNumber(selectedProduct));
    }
  }, [selectedProduct]);

  /** Call this to re-roll a new unique batch number for the selected product */
  const regenerateBatchNumber = useCallback(() => {
    if (selectedProduct) setBatchNumber(generateBatchNumber(selectedProduct));
  }, [selectedProduct]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = useCallback(() => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    setBatchNumber('');
    setManufactureDate('');
    setExpiryDate('');
    setInitialQuantity(0);
    setSearchQuery('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error('Select a product first.');
    if (!batchNumber) return toast.error('Batch number is required.');
    if (!expiryDate) return toast.error('Expiry date is required.');
    if (initialQuantity < 0) return toast.error('Initial quantity cannot be negative.');

    setLoading(true);
    try {
      const res = await fetchAPI('/product-batches', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProduct.id,
          variantId: selectedVariant?.id || null,
          batchNumber,
          manufactureDate: manufactureDate || undefined,
          expiryDate,
          initialQuantity: Number(initialQuantity),
        }),
      });

      if (res.success) {
        toast.success('Batch registered successfully');
        resetForm();
        onSuccess();
      }
    } catch {
      toast.error('Failed to register batch.');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    searchQuery,
    setSearchQuery,
    searchLoading,
    products: filteredProducts,
    rawProducts: products,
    selectedProduct,
    setSelectedProduct,
    selectedVariant,
    setSelectedVariant,
    batchNumber,
    setBatchNumber,
    regenerateBatchNumber,
    manufactureDate,
    setManufactureDate,
    expiryDate,
    setExpiryDate,
    initialQuantity,
    setInitialQuantity,
    handleSubmit,
    resetForm,
  };
}
