'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Product, ProductVariant } from './useBatchRegistry';

export function useCreateBatch(isOpen: boolean, onSuccess: () => void) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Form Fields
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [initialQuantity, setInitialQuantity] = useState<number>(0);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetchAPI('/products?limit=50');
      if (res.success) {
        setProducts(res.data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      void fetchProducts();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchProducts, isOpen]);

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
    products: filteredProducts,
    rawProducts: products,
    selectedProduct,
    setSelectedProduct,
    selectedVariant,
    setSelectedVariant,
    batchNumber,
    setBatchNumber,
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
