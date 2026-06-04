'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export function usePurchaseOrderForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefillProductId = searchParams?.get('productId');

    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchProduct, setSearchProduct] = useState('');
    const [formData, setFormData] = useState({
        supplierId: '',
        referenceNumber: `PO-${Date.now().toString().slice(-6)}`,
        items: [] as OrderItem[],
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [supRes, prodRes] = await Promise.all([
                    fetchAPI('/suppliers'),
                    fetchAPI('/products?limit=100'),
                ]);
                const parsedSuppliers = Array.isArray(supRes)
                    ? supRes
                    : Array.isArray(supRes?.data)
                        ? supRes.data
                        : (supRes?.data?.items || []);
                setSuppliers(parsedSuppliers);
                setProducts(prodRes?.data || []);
            } catch (error) {
                console.error('Data loading failed', error);
            }
        };
        void loadInitialData();
    }, []);

    const addItem = useCallback((product: any, variant?: any) => {
        if (formData.items.find(item =>
            variant
                ? (item.productId === product.id && item.variantId === variant.id)
                : (item.productId === product.id && !item.variantId)
        )) {
            toast.error('Item already added');
            return;
        }

        const variantLabel = variant
            ? Object.entries(variant.combination).map(([k, v]) => `${k}: ${v}`).join(', ')
            : '';

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                productId: product.id,
                variantId: variant?.id || null,
                name: product.name,
                variantLabel,
                sku: variant?.sku || product.sku || product.slug,
                quantity: 1,
                unitPrice: variant?.price || product.price,
            }],
        }));
        setSearchProduct('');
    }, [formData.items]);

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
    }, [prefillProductId, products, addItem]);

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

    const filteredProductList = useMemo(() =>
        products.filter((p: any) =>
            p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
            !formData.items.find(item => item.productId === p.id && !p.variants?.length)
        ),
        [products, searchProduct, formData.items]
    );

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
