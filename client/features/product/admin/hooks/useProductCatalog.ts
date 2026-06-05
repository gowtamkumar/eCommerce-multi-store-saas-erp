'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { useApiList } from '@/hooks/useApiList';
import { useApiMutation } from '@/hooks/useApiMutation';
import { Product } from '@/types/product';
import type { ProductPagination, ProductSortField, ProductSortOrder } from '../types';
import { getLandingPagePayload } from '../utils/landingPageTemplate';

const PAGE_SIZE = 10;

const getSortParam = (sortBy?: ProductSortField, sortOrder?: ProductSortOrder) => {
  if (sortBy === 'name') return sortOrder === 'DESC' ? 'name-desc' : 'name-asc';
  if (sortBy === 'price') return sortOrder === 'DESC' ? 'price-high' : 'price-low';
  return 'newest';
};

export function useProductCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<ProductSortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<ProductSortOrder>('ASC');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
  });

  const router = useRouter();
  const { mutate } = useApiMutation();

  const buildEndpoint = useCallback(
    (page: number) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
        sort: getSortParam(sortBy, sortOrder),
      });
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (filterLowStock) params.set('lowStock', 'true');
      return `/products?${params}`;
    },
    [searchQuery, sortBy, sortOrder, statusFilter, filterLowStock],
  );

  const {
    items: products,
    loading,
    pagination,
    setPagination,
    refresh,
    handlePageChange,
    resetToFirstPage,
  } = useApiList<Product>({
    buildEndpoint,
    pageSize: PAGE_SIZE,
    searchQuery,
    debounceMs: 400,
    errorMessage: 'Failed to load products',
    deps: [statusFilter, filterLowStock, sortBy, sortOrder],
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetToFirstPage();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    resetToFirstPage();
  };

  const handleLowStockToggle = () => {
    setFilterLowStock(prev => !prev);
    resetToFirstPage();
  };

  const handleSortChange = (value: ProductSortField) => {
    if (sortBy === value) {
      setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(value);
      setSortOrder('ASC');
    }
    resetToFirstPage();
  };

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      isDangerous: true,
      onConfirm: async () => {
        const result = await mutate(`/products/${id}`, { method: 'DELETE' }, {
          successMessage: 'Product deleted successfully',
          errorMessage: 'Error deleting product',
        });
        if (result.success) {
          const nextPage = products.length === 1 && pagination.page > 1
            ? pagination.page - 1
            : pagination.page;
          setPagination(prev => ({ ...prev, page: nextPage }));
          refresh(nextPage);
        }
      },
    });
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const result = await mutate(
      `/products/${id}`,
      { method: 'PATCH', body: JSON.stringify({ status: newStatus }) },
      { successMessage: 'Product status updated', errorMessage: 'Error updating product status' },
    );
    if (result.success) {
      refresh(pagination.page);
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
    pagination: pagination as ProductPagination,
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
