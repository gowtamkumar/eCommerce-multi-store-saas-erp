'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface OrderItem {
    productId: string;
    variantId: string | null;
    name: string;
    variantLabel: string;
    sku: string;
    quantity: number;
    unitPrice: number;
}

function formatVariantLabel(combination?: Record<string, string> | null) {
    if (!combination || typeof combination !== 'object') return '';
    return Object.entries(combination)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
}

function productMatchesQuery(product: any, query: string) {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const haystacks = [
        product.name,
        product.sku,
        product.barcode,
        product.slug,
        ...(product.variants || []).flatMap((v: any) => [
            v.sku,
            v.barcode,
            ...Object.values(v.combination || {}),
        ]),
    ]
        .filter(Boolean)
        .map((value: string) => String(value).toLowerCase());

    return haystacks.some((value) => value.includes(q));
}

export function usePurchaseOrderForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefillProductId = searchParams?.get('productId');

    const [loading, setLoading] = useState(false);
    const [searchingProducts, setSearchingProducts] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [formData, setFormData] = useState({
        supplierId: '',
        referenceNumber: `PO-${Date.now().toString().slice(-6)}`,
        items: [] as OrderItem[],
    });
    const searchRequestId = useRef(0);

    const loadProducts = useCallback(async (query = '') => {
        const requestId = ++searchRequestId.current;
        setSearchingProducts(true);
        try {
            const params = new URLSearchParams({
                limit: '100',
                includeVariants: 'true',
            });
            if (query.trim()) params.set('q', query.trim());

            const prodRes = await fetchAPI(`/products?${params.toString()}`);
            if (requestId !== searchRequestId.current) return;

            setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
        } catch (error) {
            console.error('Product loading failed', error);
            if (requestId === searchRequestId.current) {
                toast.error('Failed to load products');
            }
        } finally {
            if (requestId === searchRequestId.current) {
                setSearchingProducts(false);
            }
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const supRes = await fetchAPI('/suppliers');
                const parsedSuppliers = Array.isArray(supRes)
                    ? supRes
                    : Array.isArray(supRes?.data)
                        ? supRes.data
                        : (supRes?.data?.items || []);
                setSuppliers(parsedSuppliers);
            } catch (error) {
                console.error('Data loading failed', error);
            }
        };
        void loadInitialData();
    }, []);

    // Debounced server search so SKU / variant matches beyond the first page still appear
    useEffect(() => {
        const timer = setTimeout(() => {
            void loadProducts(searchProduct);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchProduct, loadProducts]);

    const addItem = useCallback((product: any, variant?: any) => {
        setFormData(prev => {
            const alreadyAdded = prev.items.find(item =>
                variant
                    ? (item.productId === product.id && item.variantId === variant.id)
                    : (item.productId === product.id && !item.variantId)
            );
            if (alreadyAdded) {
                toast.error('Item already added');
                return prev;
            }

            const variantLabel = formatVariantLabel(variant?.combination);

            return {
                ...prev,
                items: [...prev.items, {
                    productId: product.id,
                    variantId: variant?.id || null,
                    name: product.name,
                    variantLabel,
                    sku: variant?.sku || product.sku || product.slug,
                    quantity: 1,
                    unitPrice: Number(variant?.averageCost || variant?.price || product.averageCost || product.price || 0),
                }],
            };
        });
        setSearchProduct('');
    }, []);

    // Handle pre-fill from URL
    useEffect(() => {
        if (prefillProductId && products.length > 0) {
            const product = products.find((p: any) => p.id === prefillProductId);
            if (product && formData.items.length === 0) {
                if (!product.variants || product.variants.length === 0) {
                    addItem(product);
                } else {
                    setSearchProduct(product.name);
                }
            }
        }
    }, [prefillProductId, products, addItem, formData.items.length]);

    const removeItem = useCallback((index: number) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems.splice(index, 1);
            return { ...prev, items: newItems };
        });
    }, []);

    const updateItem = useCallback((index: number, field: string, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    }, []);

    const totalAmount = useMemo(() =>
        formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        [formData.items]
    );

    const filteredProductList = useMemo(() => {
        const addedKeys = new Set(
            formData.items.map(item => `${item.productId}:${item.variantId || 'base'}`)
        );

        return products
            .filter((p: any) => productMatchesQuery(p, searchProduct))
            .map((p: any) => {
                if (p.variants?.length) {
                    const availableVariants = p.variants.filter(
                        (v: any) => !addedKeys.has(`${p.id}:${v.id}`)
                    );
                    return availableVariants.length ? { ...p, variants: availableVariants } : null;
                }
                return addedKeys.has(`${p.id}:base`) ? null : p;
            })
            .filter(Boolean);
    }, [products, searchProduct, formData.items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            toast.error('Add at least one item');
            return;
        }
        setLoading(true);
        try {
            await fetchAPI('/purchase-orders', {
                method: 'POST',
                body: JSON.stringify({
                    supplierId: formData.supplierId,
                    referenceNumber: formData.referenceNumber,
                    items: formData.items.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId || null,
                        quantity: parseInt(String(item.quantity)),
                        unitPrice: parseFloat(String(item.unitPrice)),
                    })),
                }),
            });
            toast.success('Purchase order created successfully');
            router.push('/admin/procurement/purchases');
        } catch (error) {
            console.error('Error saving purchase order:', error);
            toast.error('Failed to create purchase order');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        searchingProducts,
        suppliers,
        products,
        searchProduct,
        setSearchProduct,
        formData,
        setFormData,
        totalAmount,
        filteredProductList,
        addItem,
        removeItem,
        updateItem,
        handleSubmit,
    };
}
