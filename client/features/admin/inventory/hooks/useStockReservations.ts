'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { fetchAPI } from '@/services/api';

export type ReservationStatus = 'ACTIVE' | 'FULFILLED' | 'RELEASED' | 'EXPIRED';

export interface AtpVariant {
    id: string;
    sku?: string;
    stock?: number;
    combination?: Record<string, string>;
}

export interface AtpProduct {
    id: string;
    name: string;
    slug?: string;
    stock?: number;
    images?: string[];
    variants?: AtpVariant[];
}

export interface StockReservation {
    id: string;
    productId: string;
    product?: {
        id: string;
        name: string;
        images?: string[];
        slug?: string;
    };
    variantId: string | null;
    variant?: {
        id: string;
        sku: string;
        combination: Record<string, string>;
    } | null;
    warehouseId: string | null;
    warehouse?: {
        id: string;
        name: string;
        code: string;
    } | null;
    orderId: string | null;
    reservedQty: number;
    fulfilledQty: number;
    releasedQty: number;
    status: ReservationStatus;
    expiresAt: string | null;
    reservedAt: string;
    releasedAt: string | null;
    notes: string | null;
}

export function useStockReservations() {
    const [reservations, setReservations] = useState<StockReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // ATP Calculator State
    const [atpProducts, setAtpProducts] = useState<AtpProduct[]>([]);
    const [atpSearchQuery, setAtpSearchQuery] = useState('');
    const [selectedAtpProduct, setSelectedAtpProduct] = useState<AtpProduct | null>(null);
    const [selectedAtpVariant, setSelectedAtpVariant] = useState<AtpVariant | null>(null);
    const [atpPhysicalBalance, setAtpPhysicalBalance] = useState<number>(0);
    const [calculatingAtp, setCalculatingAtp] = useState(false);
    const [atpResult, setAtpResult] = useState<{
        productId: string;
        variantId: string | null;
        physicalBalance: number;
        openReserved: number;
        atp: number;
    } | null>(null);
    const [showProductDropdown, setShowProductDropdown] = useState(false);

    // Fetch Reservations
    const fetchReservations = useCallback(async (page: number, status: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(status !== 'all' && { status })
            });

            const res = await fetchAPI(`/admin/inventory/reservations?${params}`);
            if (res.success && res.data) {
                setReservations(res.data.items || []);
                setPagination({
                    page: page,
                    limit: 10,
                    total: res.data.total || 0,
                    totalPages: Math.ceil((res.data.total || 0) / 10)
                });
            }
        } catch (error) {
            console.error('Failed to fetch reservations', error);
            toast.error('Failed to load stock reservations');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load and filter change
    useEffect(() => {
        fetchReservations(1, statusFilter);
    }, [statusFilter, fetchReservations]);

    // Fetch products for ATP tool
    const loadAtpProducts = useCallback(async () => {
        try {
            const res = await fetchAPI('/products?limit=100');
            if (res.success && res.data) {
                setAtpProducts(res.data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch ATP products', error);
        }
    }, []);

    useEffect(() => {
        loadAtpProducts();
    }, [loadAtpProducts]);

    // Handle Page change
    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchReservations(newPage, statusFilter);
        }
    }, [pagination.totalPages, statusFilter, fetchReservations]);

    // Client-side search filtering across loaded items
    const filteredReservations = useMemo(() => {
        if (!searchQuery) return reservations;
        const query = searchQuery.toLowerCase();
        return reservations.filter(r => {
            const matchesProduct = r.product?.name?.toLowerCase().includes(query) || false;
            const matchesSku = r.variant?.sku?.toLowerCase().includes(query) || false;
            const matchesOrderId = r.orderId?.toLowerCase().includes(query) || false;
            const matchesNotes = r.notes?.toLowerCase().includes(query) || false;
            return matchesProduct || matchesSku || matchesOrderId || matchesNotes;
        });
    }, [reservations, searchQuery]);

    // Filter products list for ATP dropdown
    const filteredAtpProducts = useMemo(() => {
        if (!atpSearchQuery) return atpProducts;
        return atpProducts.filter(p =>
            p.name.toLowerCase().includes(atpSearchQuery.toLowerCase()) ||
            (p.slug || '').toLowerCase().includes(atpSearchQuery.toLowerCase())
        );
    }, [atpProducts, atpSearchQuery]);

    // Check ATP Action
    const handleCalculateAtp = async () => {
        if (!selectedAtpProduct) {
            toast.error('Please select a product first');
            return;
        }
        setCalculatingAtp(true);
        try {
            const params = new URLSearchParams({
                productId: selectedAtpProduct.id,
                ...(selectedAtpVariant && { variantId: selectedAtpVariant.id }),
                physicalBalance: atpPhysicalBalance.toString()
            });

            const res = await fetchAPI(`/admin/inventory/reservations/atp?${params}`);
            if (res) {
                setAtpResult(res);
                toast.success('ATP calculated successfully');
            }
        } catch (error) {
            console.error('Failed to calculate ATP', error);
            toast.error('Error fetching Available-to-Promise data');
        } finally {
            setCalculatingAtp(false);
        }
    };

    // Reset ATP tool
    const handleResetAtp = useCallback(() => {
        setSelectedAtpProduct(null);
        setSelectedAtpVariant(null);
        setAtpSearchQuery('');
        setAtpPhysicalBalance(0);
        setAtpResult(null);
    }, []);

    const handleSelectAtpProduct = useCallback((product: AtpProduct) => {
        setSelectedAtpProduct(product);
        setSelectedAtpVariant(null);
        setShowProductDropdown(false);
        setAtpSearchQuery('');
    }, []);

    const handleSelectAtpVariant = useCallback((variant: AtpVariant) => {
        setSelectedAtpVariant(prev => prev?.id === variant.id ? null : variant);
    }, []);

    return {
        reservations: filteredReservations,
        rawReservations: reservations,
        loading,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery,
        pagination,
        handlePageChange,
        
        // ATP properties
        atpProducts: filteredAtpProducts,
        rawAtpProducts: atpProducts,
        atpSearchQuery,
        setAtpSearchQuery,
        selectedAtpProduct,
        selectedAtpVariant,
        atpPhysicalBalance,
        setAtpPhysicalBalance,
        calculatingAtp,
        atpResult,
        showProductDropdown,
        setShowProductDropdown,
        handleCalculateAtp,
        handleResetAtp,
        handleSelectAtpProduct,
        handleSelectAtpVariant,
        fetchReservations,
    };
}
