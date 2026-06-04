'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';
import { Product } from '@/types/product';
import ConfirmModal from '@/components/shared/ConfirmModal';
import ProductList from './ProductList';
import { useDebounce } from '@/hooks/useDebounce';
import type { ProductPagination, ProductSortField, ProductSortOrder } from './types';

const PAGE_SIZE = 10;

const getSortParam = (sortBy?: ProductSortField, sortOrder?: ProductSortOrder) => {
    if (sortBy === 'name') return sortOrder === 'DESC' ? 'name-desc' : 'name-asc';
    if (sortBy === 'price') return sortOrder === 'DESC' ? 'price-high' : 'price-low';
    return 'newest';
};

export default function ProductDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 400);
    const [statusFilter, setStatusFilter] = useState('all');
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
        onConfirm: () => { },
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
    }, [debouncedSearch, pagination.page, sortBy, sortOrder, statusFilter]);

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

    const handleSortChange = (value: ProductSortField) => {
        if (sortBy === value) {
            setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
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
                body: JSON.stringify({ status: newStatus })
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
            // 1. Create Page
            const pageRes = await fetchAPI('/pages', {
                method: 'POST',
                body: JSON.stringify({
                    title: `${product.name} Landing Page`,
                    slug: `landing-${product.slug}-${Date.now().toString().slice(-4)}`,
                    status: 'published',
                    sections: [
                        {
                            id: `section-banner`,
                            type: 'banner',
                            settings: {
                                slides: [
                                    {
                                        id: `slide-1`,
                                        headline: product.name,
                                        subline: 'Premium quality you can trust. Limited time offer.',
                                        buttonText: 'Order Now',
                                        buttonLink: '#landing-checkout',
                                        image: product.images?.[0] || '',
                                        overlayOpacity: 40
                                    }
                                ]
                            },
                            styles: {
                                paddingTop: 0,
                                paddingBottom: 0,
                                textAlign: 'center',
                                textColor: '#FFFFFF',
                                headlineColor: '#FFFFFF',
                                sublineColor: '#ECECEC',
                                buttonColor: '#FFFFFF',
                                buttonTextColor: '#000000',
                                height: 500
                            }
                        },
                        {
                            id: `section-main-container`,
                            type: 'section',
                            settings: {},
                            styles: {
                                paddingTop: 80,
                                paddingBottom: 100,
                                backgroundColor: '#F9FAFB'
                            },
                            children: [
                                {
                                    id: `row-inner`,
                                    type: 'row',
                                    settings: {},
                                    styles: {
                                        maxWidth: 1100,
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                        gap: 40,
                                        alignItems: 'stretch',
                                        paddingLeft: 20,
                                        paddingRight: 20
                                    },
                                    children: [
                                        {
                                            id: `col-product-image`,
                                            type: 'column',
                                            settings: {},
                                            styles: {
                                                flex: 1,
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: '32px',
                                                padding: 40,
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                                                border: '1px solid #F1F5F9'
                                            },
                                            children: [
                                                {
                                                    id: `img-block`,
                                                    type: 'image-block',
                                                    settings: { image: product.images?.[0] || '' },
                                                    styles: {
                                                        imageRadius: '24px',
                                                        imageShadow: '0 15px 35px rgba(0,0,0,0.08)'
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            id: `col-product-info`,
                                            type: 'column',
                                            settings: {},
                                            styles: {
                                                flex: 1.2,
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: '32px',
                                                padding: 50,
                                                boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
                                                border: '1px solid #F1F5F9',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            },
                                            children: [
                                                {
                                                    id: `badge-text`,
                                                    type: 'text-block',
                                                    settings: { html: '<span style="background: #EEF2FF; color: #4F46E5; padding: 8px 16px; border-radius: 999px; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Special Offer</span>' },
                                                    styles: { marginBottom: 24 }
                                                },
                                                {
                                                    id: `product-heading`,
                                                    type: 'heading',
                                                    settings: { text: product.name, level: 'h1' },
                                                    styles: { marginBottom: 20, textAlign: 'left', fontWeight: '900', fontSize: '46px', lineHeight: '1.2', color: '#111827' }
                                                },
                                                {
                                                    id: `product-desc`,
                                                    type: 'text-block',
                                                    settings: { html: `<div style="font-size: 18px; line-height: 1.8; color: #4B5563; margin-bottom: 32px;">${product.description || 'Elevate your daily experience with our premium product, crafted with precision and care.'}</div>` },
                                                    styles: { textAlign: 'left' }
                                                },
                                                {
                                                    id: `product-features`,
                                                    type: 'text-block',
                                                    settings: {
                                                        html: `
                                                            <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
                                                                <div style="display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;"><div style="min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">✓</div> Authentic Quality Assured</div>
                                                                <div style="display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;"><div style="min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">✓</div> Fast Doorstep Delivery</div>
                                                                <div style="display: flex; align-items: center; gap: 14px; font-weight: 600; color: #1F2937; font-size: 16px;"><div style="min-width: 26px; height: 26px; background: #10B981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px;">✓</div> Cash on Delivery Available</div>
                                                            </div>
                                                        `
                                                    },
                                                    styles: { textAlign: 'left' }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    id: `checkout-container`,
                                    type: 'checkout',
                                    settings: {
                                        productId: product.id,
                                        title: 'Complete Your Order',
                                        buttonText: 'Order Now - Cash on Delivery',
                                        showProductSummary: true
                                    },
                                    styles: {
                                        paddingTop: 60,
                                        paddingBottom: 0,
                                        maxWidth: 950,
                                        marginLeft: 'auto',
                                        marginRight: 'auto'
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            if (!pageRes.success || !pageRes.data?.id) throw new Error('Failed to create page');
            const newPage = pageRes.data;

            // 2. Link to Product
            const linkRes = await fetchAPI(`/products/${product.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ landingPageId: newPage.id })
            });

            if (!linkRes.success) throw new Error('Failed to link page to product');

            toast.success('Landing page created!', { id: toastId });
            router.push(`/admin/pages/${newPage.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create landing page', { id: toastId });
        }
    };

    return (
        <>
            <ProductList
                products={products}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={handleStatusFilterChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                pagination={pagination}
                onPageChange={handlePageChange}
                onDelete={handleDelete}
                onStatusChange={handleStatusUpdate}
                onLandingPage={handleLandingPage}
            />

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDangerous={confirmModal.isDangerous}
            />
        </>
    );
}
