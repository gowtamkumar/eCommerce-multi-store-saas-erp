'use client';

import { fetchAPI } from '@/services/api';
import { createSupplierInvoice, getPurchaseOrders, getSuppliers } from '@/services/procurement';
import { Supplier } from '@/features/admin/supplier/types';
import { PurchaseOrder } from '@/features/admin/purchase/types';
import { Product } from '@/features/admin/product/types';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function useReceiveInvoiceForm(onSuccess: () => void, onClose: () => void) {
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [selectedPoId, setSelectedPoId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    
    // Dropdown options
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

    // Item selection
    const [selectedProductId, setSelectedProductId] = useState('');
    const [qty, setQty] = useState(1);
    const [unitPrice, setUnitPrice] = useState('');
    const [addedItems, setAddedItems] = useState<{ productId: string; name: string; quantity: number; unitPrice: number }[]>([]);

    // Load initial dropdowns
    useEffect(() => {
        getSuppliers().then(setSuppliers).catch(console.error);
        getPurchaseOrders().then(setPurchaseOrders).catch(console.error);
        fetchAPI('/products?limit=100')
            .then((res) => setProducts(res?.data || []))
            .catch(console.error);
    }, []);

    // Load PO items when PO is selected
    useEffect(() => {
        if (!selectedPoId) {
            setAddedItems([]);
            return;
        }

        const po = purchaseOrders.find((p) => p.id === selectedPoId);
        const supplierId = po?.supplierId || po?.supplier?.id;
        if (po && supplierId && !selectedSupplierId) {
            setSelectedSupplierId(supplierId);
        }

        const loadPoItems = async () => {
            try {
                const res = await fetchAPI(`/purchase-orders/${selectedPoId}`);
                if (res.success && res.data && Array.isArray(res.data.items)) {
                    setAddedItems(
                        res.data.items.map((item: any) => ({
                            productId: item.productId,
                            name: item.product?.name || 'Unknown Product',
                            quantity: item.quantity,
                            unitPrice: Number(item.unitPrice),
                        }))
                    );
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load purchase order items');
            }
        };
        void loadPoItems();
    }, [selectedPoId, purchaseOrders, selectedSupplierId]);

    const handleAddItem = useCallback(() => {
        if (!selectedProductId || !unitPrice) {
            toast.error('Select product and enter unit price');
            return;
        }
        const product = products.find((p) => p.id === selectedProductId);
        if (!product) return;

        if (addedItems.some((item) => item.productId === selectedProductId)) {
            toast.error('Product already added');
            return;
        }

        setAddedItems([
            ...addedItems,
            {
                productId: selectedProductId,
                name: product.name,
                quantity: qty,
                unitPrice: parseFloat(unitPrice),
            },
        ]);

        setSelectedProductId('');
        setQty(1);
        setUnitPrice('');
    }, [selectedProductId, unitPrice, products, addedItems, qty]);

    const handleRemoveItem = useCallback((index: number) => {
        setAddedItems(addedItems.filter((_, i) => i !== index));
    }, [addedItems]);

    const resetForm = useCallback(() => {
        setInvoiceNumber('');
        setSelectedSupplierId('');
        setSelectedPoId('');
        setInvoiceDate('');
        setDueDate('');
        setAddedItems([]);
        setSelectedProductId('');
        setQty(1);
        setUnitPrice('');
    }, []);

    const handleCreateInvoice = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceNumber || !selectedSupplierId || !selectedPoId || !invoiceDate || !dueDate) {
            toast.error('Please fill in all header details');
            return;
        }
        if (addedItems.length === 0) {
            toast.error('Add at least one item');
            return;
        }

        try {
            await createSupplierInvoice({
                invoiceNumber,
                supplierId: selectedSupplierId,
                purchaseOrderId: selectedPoId,
                invoiceDate: new Date(invoiceDate).toISOString(),
                dueDate: new Date(dueDate).toISOString(),
                items: addedItems.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
            });

            toast.success('Invoice submitted successfully');
            resetForm();
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to submit invoice');
        }
    }, [invoiceNumber, selectedSupplierId, selectedPoId, invoiceDate, dueDate, addedItems, onSuccess, onClose, resetForm]);

    return {
        invoiceNumber,
        setInvoiceNumber,
        selectedSupplierId,
        setSelectedSupplierId,
        selectedPoId,
        setSelectedPoId,
        invoiceDate,
        setInvoiceDate,
        dueDate,
        setDueDate,
        suppliers,
        purchaseOrders,
        products,
        selectedProductId,
        setSelectedProductId,
        qty,
        setQty,
        unitPrice,
        setUnitPrice,
        addedItems,
        handleAddItem,
        handleRemoveItem,
        handleCreateInvoice,
    };
}
