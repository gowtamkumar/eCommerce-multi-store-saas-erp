'use client';

import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export interface OrderItem {
    productId: string;
    variantId: string | null;
    name: string;
    variantLabel: string;
    sku: string;
    quantity: number | string;
    unitPrice: number | string;
}

export interface PurchaseFormErrors {
    supplierId?: string;
    referenceNumber?: string;
    items?: string;
    lines?: Record<string, { quantity?: string; unitPrice?: string }>;
}

function formatVariantLabel(combination?: Record<string, string> | null) {
    if (!combination || typeof combination !== 'object') return '';
    return Object.entries(combination)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
}

function lineKey(item: Pick<OrderItem, 'productId' | 'variantId'>) {
    return `${item.productId}:${item.variantId || 'base'}`;
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

function validatePurchaseForm(formData: {
    supplierId: string;
    referenceNumber: string;
    items: OrderItem[];
}): { valid: boolean; errors: PurchaseFormErrors } {
    const errors: PurchaseFormErrors = { lines: {} };

    if (!formData.supplierId) {
        errors.supplierId = 'Select a supplier';
    }

    const ref = formData.referenceNumber?.trim() || '';
    if (!ref) {
        errors.referenceNumber = 'Reference number is required';
    } else if (ref.length < 3) {
        errors.referenceNumber = 'Reference must be at least 3 characters';
    } else if (ref.length > 64) {
        errors.referenceNumber = 'Reference must be 64 characters or less';
    }

    if (formData.items.length === 0) {
        errors.items = 'Add at least one product line';
    }

    formData.items.forEach((item) => {
        const key = lineKey(item);
        const lineErrors: { quantity?: string; unitPrice?: string } = {};
        const qty = Number(item.quantity);
        const price = Number(item.unitPrice);

        if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
            lineErrors.quantity = 'Qty must be a whole number ≥ 1';
        } else if (qty > 1_000_000) {
            lineErrors.quantity = 'Qty is too large';
        }

        if (!Number.isFinite(price) || price < 0) {
            lineErrors.unitPrice = 'Price must be 0 or greater';
        } else if (price > 100_000_000) {
            lineErrors.unitPrice = 'Price is too large';
        }

        if (lineErrors.quantity || lineErrors.unitPrice) {
            errors.lines![key] = lineErrors;
        }
    });

    const hasLineErrors = Object.keys(errors.lines || {}).length > 0;
    if (!hasLineErrors) delete errors.lines;

    const valid = !errors.supplierId && !errors.referenceNumber && !errors.items && !hasLineErrors;
    return { valid, errors };
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
    const [errors, setErrors] = useState<PurchaseFormErrors>({});
    const [touched, setTouched] = useState(false);
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

    useEffect(() => {
        const timer = setTimeout(() => {
            void loadProducts(searchProduct);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchProduct, loadProducts]);

    const clearFieldError = useCallback((field: keyof PurchaseFormErrors) => {
        setErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const addItem = useCallback((product: any, variant?: any) => {
        if (product.variants?.length > 0 && !variant) {
            toast.error('Select a specific variant for this product');
            return;
        }

        setFormData(prev => {
            const alreadyAdded = prev.items.find(item =>
                variant
                    ? (item.productId === product.id && item.variantId === variant.id)
                    : (item.productId === product.id && !item.variantId)
            );
            if (alreadyAdded) {
                toast.error('This item is already on the order');
                return prev;
            }

            return {
                ...prev,
                items: [...prev.items, {
                    productId: product.id,
                    variantId: variant?.id || null,
                    name: product.name,
                    variantLabel: formatVariantLabel(variant?.combination),
                    sku: variant?.sku || product.sku || product.slug,
                    quantity: 1,
                    unitPrice: Number(variant?.averageCost || variant?.price || product.averageCost || product.price || 0),
                }],
            };
        });
        setErrors(prev => {
            if (!prev.items) return prev;
            const next = { ...prev };
            delete next.items;
            return next;
        });
        setSearchProduct('');
        toast.success(variant ? `Added ${product.name} (${formatVariantLabel(variant.combination) || variant.sku})` : `Added ${product.name}`);
    }, []);

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

    const updateItem = useCallback((index: number, field: 'quantity' | 'unitPrice', value: string) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            const item = { ...newItems[index] };
            const key = lineKey(item);

            if (field === 'quantity') {
                // Allow empty while typing; coerce later on submit
                if (value === '') {
                    item.quantity = '';
                } else {
                    const parsed = parseInt(value, 10);
                    item.quantity = Number.isFinite(parsed) ? parsed : value;
                }
            } else {
                if (value === '') {
                    item.unitPrice = '';
                } else {
                    const parsed = parseFloat(value);
                    item.unitPrice = Number.isFinite(parsed) ? parsed : value;
                }
            }

            newItems[index] = item;

            setErrors(prevErrors => {
                if (!prevErrors.lines?.[key]) return prevErrors;
                const nextLines = { ...prevErrors.lines };
                const line = { ...nextLines[key] };
                delete line[field];
                if (!line.quantity && !line.unitPrice) {
                    delete nextLines[key];
                } else {
                    nextLines[key] = line;
                }
                const next = { ...prevErrors, lines: nextLines };
                if (Object.keys(nextLines).length === 0) delete next.lines;
                return next;
            });

            return { ...prev, items: newItems };
        });
    }, []);

    const totalAmount = useMemo(() =>
        formData.items.reduce((sum, item) => {
            const qty = Number(item.quantity);
            const price = Number(item.unitPrice);
            if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;
            return sum + qty * price;
        }, 0),
        [formData.items]
    );

    const filteredProductList = useMemo(() => {
        const addedKeys = new Set(
            formData.items.map(item => lineKey(item))
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

    const canSubmit = useMemo(() => {
        const { valid } = validatePurchaseForm(formData);
        return valid && !loading;
    }, [formData, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched(true);

        const { valid, errors: nextErrors } = validatePurchaseForm(formData);
        setErrors(nextErrors);

        if (!valid) {
            const firstMessage =
                nextErrors.supplierId ||
                nextErrors.referenceNumber ||
                nextErrors.items ||
                'Fix the highlighted line items before saving';
            toast.error(firstMessage);
            return;
        }

        setLoading(true);
        try {
            await fetchAPI('/purchase-orders', {
                method: 'POST',
                body: JSON.stringify({
                    supplierId: formData.supplierId,
                    referenceNumber: formData.referenceNumber.trim(),
                    items: formData.items.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId || null,
                        quantity: parseInt(String(item.quantity), 10),
                        unitPrice: parseFloat(String(item.unitPrice)),
                    })),
                }),
            });
            toast.success('Purchase order created successfully');
            router.push('/admin/procurement/purchases');
        } catch (error: any) {
            console.error('Error saving purchase order:', error);
            toast.error(error?.message || 'Failed to create purchase order');
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
        errors,
        touched,
        clearFieldError,
        totalAmount,
        filteredProductList,
        canSubmit,
        addItem,
        removeItem,
        updateItem,
        handleSubmit,
        lineKey,
    };
}
