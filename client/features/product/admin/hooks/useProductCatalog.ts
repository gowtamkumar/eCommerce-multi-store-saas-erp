'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Product } from '@/types/product';
import { useDebounce } from '@/hooks/useDebounce';
import type { ProductPagination, ProductSortField, ProductSortOrder } from '../types';
import { getLandingPagePayload } from '../utils/landingPageTemplate';

const PAGE_SIZE = 10;

const getSortParam = (sortBy?: ProductSortField, sortOrder?: ProductSortOrder) => {
  if (sortBy === 'name') return sortOrder === 'DESC' ? 'name-desc' : 'name-asc';
  if (sortBy === 'price') return sortOrder === 'DESC' ? 'price-high' : 'price-low';
  return 'newest';
};

export function useProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<ProductSortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('ASC');
  const [pagination, setPagination] = useState<ProductPagination>({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
  });

  const router = useRouter();
  const requestIdRef = useRef(0);

  const fetchProducts = useCallback(async (page = pagination.page) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        sort: getSortParam(sortBy, sortOrder),
      });
      if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (filterLowStock) params.set('lowStock', 'true');

      const res = await fetchAPI(`/products?${params}`);
      if (requestId !== requestIdRef.current) return;

      if (res.success && res.data) {
        setProducts(res.data);
        const nextPagination = res.pagination || {
          total: res.data.length,
          page,
          limit: PAGE_SIZE,
          totalPages: 1,
        };
        setPagination(nextPagination);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to fetch products', error);
      toast.error('Failed to load products');
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [debouncedSearch, pagination.page, sortBy, sortOrder, statusFilter, filterLowStock]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchProducts(pagination.page);
    }, 0);
    return () => clearTimeout(t);
  }, [fetchProducts, pagination.page]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleLowStockToggle = () => {
    setFilterLowStock(prev => !prev);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (value: ProductSortField) => {
    if (sortBy === value) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(value);
      setSortOrder('ASC');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      isDangerous: true,
      onConfirm: async () => {
        try {
          const res = await fetchAPI(`/products/${id}`, { method: 'DELETE' });
          if (res.success) {
            toast.success('Product deleted successfully');
            const nextPage = products.length === 1 && pagination.page > 1
              ? pagination.page - 1
              : pagination.page;
            setPagination(prev => ({ ...prev, page: nextPage }));
            void fetchProducts(nextPage);
          } else {
            toast.error(res.error || 'Error deleting product');
          }
        } catch {
          toast.error('Error deleting product');
        }
      },
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetchAPI(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        toast.success('Product status updated');
        void fetchProducts(pagination.page);
      } else {
        toast.error(res.error || 'Error updating product status');
      }
    } catch {
      toast.error('Error updating product status');
    }
  };

  const handleLandingPage = async (product: Product) => {
    if (product.landingPage?.id) {
      router.push(`/admin/pages/${product.landingPage.id}`);
      return;
    }

    const toastId = toast.loading('Creating landing page...');
    try {
      const payload = getLandingPagePayload(product);
      const pageRes = await fetchAPI('/pages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!pageRes.success || !pageRes.data?.id) throw new Error('Failed to create page');
      const newPage = pageRes.data;

      const linkRes = await fetchAPI(`/products/${product.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ landingPageId: newPage.id }),
      });

      if (!linkRes.success) throw new Error('Failed to link page to product');

      toast.success('Landing page created!', { id: toastId });
      router.push(`/admin/pages/${newPage.id}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create landing page', { id: toastId });
    }
  };

  return {
    products,
    loading,
    searchQuery,
    statusFilter,
    filterLowStock,
    sortBy,
    sortOrder,
    pagination,
    confirmModal,
    setConfirmModal,
    handleSearchChange,
    handleStatusFilterChange,
    handleLowStockToggle,
    handleSortChange,
    handlePageChange,
    handleDelete,
    handleStatusUpdate,
    handleLandingPage,
  };
}
