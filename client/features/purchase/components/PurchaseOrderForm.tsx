'use client';

import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { ShoppingBag, Save, Loader2, Plus, Trash2, Package, Search, ChevronLeft, Truck, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function PurchaseOrderForm() {
    const router = useRouter();
    const { formatPrice } = useSettings();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchProduct, setSearchProduct] = useState('');

    const [formData, setFormData] = useState({
        supplierId: '',
        referenceNumber: `PO-${Date.now().toString().slice(-6)}`,
        items: [] as any[]
    });

    useEffect(() => {
        Promise.all([
            fetchAPI('/suppliers'),
            fetchAPI('/products?limit=100')
        ]).then(([supRes, prodRes]) => {
            setSuppliers(Array.isArray(supRes) ? supRes : (supRes.data || []));
            setProducts(prodRes.data?.products || []);
        });
    }, []);

    const addItem = (product: any) => {
        if (formData.items.find(item => item.productId === product.id)) {
            toast.error('Product already added');
            return;
        }

        setFormData({
            ...formData,
            items: [...formData.items, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                unitPrice: product.price // Default to selling price, user can adjust
            }]
        });
        setSearchProduct('');
    };

    const removeItem = (index: number) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

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
                        quantity: parseInt(item.quantity),
                        unitPrice: parseFloat(item.unitPrice)
                    }))
                })
            });

            toast.success('Purchase order created successfully');
            router.push('/admin/purchases');
        } catch (error) {
            console.error('Error saving purchase order:', error);
            toast.error('Failed to create purchase order');
        } finally {
            setLoading(false);
        }
    };

    const filteredProductList = products.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
        !formData.items.find(item => item.productId === p.id)
    );

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/purchases" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-500" />
                </Link>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">New Purchase Order</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Order Details */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-brand-500" /> Order Items
                        </h3>

                        {/* Product Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products to add..."
                                value={searchProduct}
                                onChange={(e) => setSearchProduct(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            />

                            {searchProduct && (
                                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto">
                                    {filteredProductList.length === 0 ? (
                                        <div className="p-4 text-center text-slate-500">No products found</div>
                                    ) : (
                                        filteredProductList.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => addItem(p)}
                                                className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b last:border-0 border-slate-50 dark:border-slate-700"
                                            >
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded flex items-center justify-center">
                                                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover rounded" /> : <Package className="w-5 h-5 text-slate-400" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                                                    <div className="text-xs text-slate-500">SKU: {p.slug} | Stock: {p.stock}</div>
                                                </div>
                                                <Plus className="w-4 h-4 ml-auto text-brand-500" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="text-left border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="pb-4 font-semibold text-sm text-slate-500">Product</th>
                                        <th className="pb-4 font-semibold text-sm text-slate-500 w-24 text-center">Qty</th>
                                        <th className="pb-4 font-semibold text-sm text-slate-500 w-32">Unit Price</th>
                                        <th className="pb-4 font-semibold text-sm text-slate-500 w-32 text-right">Subtotal</th>
                                        <th className="pb-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {formData.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 italic">No items added yet. Search for products above.</td>
                                        </tr>
                                    ) : (
                                        formData.items.map((item, idx) => (
                                            <tr key={item.productId} className="group">
                                                <td className="py-4">
                                                    <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                </td>
                                                <td className="py-4">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-brand-500 outline-none"
                                                    />
                                                </td>
                                                <td className="py-4">
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-5 pr-2 py-1.5 focus:ring-2 focus:ring-brand-500 outline-none font-mono"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="py-4 text-right font-bold text-slate-900 dark:text-white">
                                                    {formatPrice(item.quantity * item.unitPrice)}
                                                </td>
                                                <td className="py-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(idx)}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {formData.items.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                <div className="text-right">
                                    <div className="text-sm text-slate-500 mb-1">Total Order Amount</div>
                                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatPrice(totalAmount)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <Truck className="w-4 h-4 text-brand-500" /> Supplier
                            </label>
                            <select
                                required
                                value={formData.supplierId}
                                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            >
                                <option value="">Select a supplier</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-brand-500" /> Reference #
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.referenceNumber}
                                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.supplierId || formData.items.length === 0}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Create Purchase Order
                    </button>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl">
                        <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                            <strong>Note:</strong> New orders are created as <strong>DRAFT</strong>. Stock will only be updated once you mark the order as <strong>RECEIVED</strong> from the list view.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}
