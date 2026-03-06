'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    User,
    Plus,
    Minus,
    Trash2,
    ChevronRight,
    ChevronLeft,
    Check,
    Package,
    Truck,
    ShoppingCart,
    Loader2,
    Tag,
    X
} from 'lucide-react';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { Product } from '@/types/product';
import Price from '@/components/shared/Price';
import toast from 'react-hot-toast';

interface SelectedItem {
    product: Product;
    variant?: any;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    totalAmount: number;
}

export default function CreateOrder() {
    const router = useRouter();
    const { formatPrice, selectedCurrency } = useSettings();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Customer State
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [manualCustomer, setManualCustomer] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // Step 2: Product State
    const [productSearch, setProductSearch] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [appliedCouponCode, setAppliedCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Step 3: Shipping State
    const [shippingData, setShippingData] = useState({
        address: '',
        notes: '',
    });

    // Fetch customers
    useEffect(() => {
        if (customerSearch.length > 2) {
            const timer = setTimeout(async () => {
                try {
                    const res = await fetchAPI(`/users?search=${customerSearch}`);
                    if (res.data?.users) {
                        setCustomers(res.data.users);
                    }
                } catch (err) {
                    console.error('Failed to fetch customers', err);
                }
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setCustomers([]);
        }
    }, [customerSearch]);

    // Fetch products
    useEffect(() => {
        if (productSearch.length > 2) {
            const timer = setTimeout(async () => {
                try {
                    const res = await fetchAPI(`/products?search=${productSearch}`);
                    if (res.data?.products) {
                        setProducts(res.data.products);
                    }
                } catch (err) {
                    console.error('Failed to fetch products', err);
                }
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setProducts([]);
        }
    }, [productSearch]);

    const addItem = (product: Product, variant?: any) => {
        const existingIndex = selectedItems.findIndex(
            item => item.product.id === product.id && item.variant?.id === variant?.id
        );

        if (existingIndex > -1) {
            const newItems = [...selectedItems];
            newItems[existingIndex].quantity += 1;
            newItems[existingIndex].totalAmount = (newItems[existingIndex].unitPrice - newItems[existingIndex].discountAmount) * newItems[existingIndex].quantity;
            setSelectedItems(newItems);
        } else {
            const unitPrice = variant?.price ? Number(variant.price) : Number(product.price);
            const discountAmount = Number(product.discountAmount) || 0;
            const newItem: SelectedItem = {
                product,
                variant,
                quantity: 1,
                unitPrice,
                discountAmount,
                totalAmount: (unitPrice - discountAmount)
            };
            setSelectedItems([...selectedItems, newItem]);
        }
        toast.success(`Added ${product.name} to order`);
    };

    const updateQuantity = (index: number, delta: number) => {
        const newItems = [...selectedItems];
        const item = newItems[index];
        const newQty = Math.max(1, item.quantity + delta);

        // Stock check
        const stock = item.variant ? item.variant.stock : item.product.stock;
        if (delta > 0 && newQty > stock) {
            toast.error('Insufficient stock');
            return;
        }

        item.quantity = newQty;
        item.totalAmount = (item.unitPrice - item.discountAmount) * item.quantity;
        setSelectedItems(newItems);
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleApplyCoupon = async () => {
        if (!appliedCouponCode) return;
        setIsValidatingCoupon(true);
        try {
            const res = await fetchAPI(`/coupons/validate/${appliedCouponCode}?amount=${subtotal - totalProductDiscount}`);
            if (res.valid) {
                setCouponDiscount(res.discountAmount);
                toast.success('Coupon applied successfully');
            } else {
                toast.error(res.message || 'Invalid coupon');
                setAppliedCouponCode('');
                setCouponDiscount(0);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to validate coupon');
            setAppliedCouponCode('');
            setCouponDiscount(0);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const subtotal = selectedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const totalProductDiscount = selectedItems.reduce((acc, item) => acc + (item.discountAmount * item.quantity), 0);
    const payable = subtotal - totalProductDiscount - couponDiscount;

    const handleSubmit = async () => {
        // Phone validation
        const phoneRegex = /^01\d{9}$/;
        const phone = manualCustomer.phone;
        console.log("phoneNumber", phone);

        if (!phoneRegex.test(phone)) {
            toast.error('Customer phone must be a valid 11-digit Bangladeshi number starting with 01');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                userId: selectedCustomer?.id,
                customerName: manualCustomer.name,
                customerEmail: manualCustomer.email,
                customerPhone: String(phone),
                address: shippingData.address,
                orderNotes: shippingData.notes,
                paymentMethod: 'cod',
                currency: selectedCurrency.code,
                currencyRate: selectedCurrency.rate,
                appliedCouponCode: appliedCouponCode || undefined,
                items: selectedItems.map(item => ({
                    productId: item.product.id,
                    variantId: item.variant?.id,
                    quantity: item.quantity
                }))
            };

            console.log("orderData", orderData);


            const res = await fetchAPI('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            if (res.success) {
                toast.success('Order created successfully');
                router.push('/admin/orders');
            } else {
                toast.error(res.error || 'Failed to create order');
            }
        } catch (err: any) {
            console.error('Order creation failed', err);
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !selectedCustomer && (!manualCustomer.name || !manualCustomer.phone)) {
            toast.error('Please select a customer or enter manual details');
            return;
        }
        if (step === 2 && selectedItems.length === 0) {
            toast.error('Please add at least one item');
            return;
        }
        if (step === 3 && !shippingData.address) {
            toast.error('Please enter shipping address');
            return;
        }
        setStep(step + 1);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">Create Inner Order</h1>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === i ? 'bg-brand-600 text-white' :
                                step > i ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}>
                                {step > i ? <Check className="w-5 h-5" /> : i}
                            </div>
                            {i < 4 && <div className={`w-8 h-0.5 ${step > i ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Step 1: Customer Selection */}
                    {step === 1 && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 md:p-8 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-brand-600" />
                                    Step 1: Customer Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search existing customers..."
                                            value={customerSearch}
                                            onChange={(e) => setCustomerSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                        {customers.length > 0 && (
                                            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                                                {customers.map(c => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => {
                                                            setSelectedCustomer(c);
                                                            setManualCustomer({
                                                                name: c.name || '',
                                                                phone: c.phone || '',
                                                                email: c.email || '',
                                                            });
                                                            setCustomerSearch('');
                                                            setCustomers([]);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
                                                    >
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                                                            <p className="text-xs text-slate-500">{c.email} | {c.phone}</p>
                                                        </div>
                                                        <Plus className="w-4 h-4 text-brand-600" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {selectedCustomer && (
                                            <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100 dark:border-brand-800 flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold">
                                                        {selectedCustomer.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">Linked to Dashboard Account</p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">ID: {selectedCustomer.id.slice(-8).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(null);
                                                        setManualCustomer({ name: '', email: '', phone: '' });
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 flex items-center gap-1 text-sm font-medium"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Unlink
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                                                <input
                                                    value={manualCustomer.name}
                                                    onChange={e => setManualCustomer({ ...manualCustomer, name: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    placeholder="Customer name"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                                                <input
                                                    value={manualCustomer.phone}
                                                    onChange={e => setManualCustomer({ ...manualCustomer, phone: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    placeholder="01XXXXXXXXX"
                                                />
                                            </div>
                                            <div className="space-y-1 md:col-span-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email (Optional)</label>
                                                <input
                                                    value={manualCustomer.email}
                                                    onChange={e => setManualCustomer({ ...manualCustomer, email: e.target.value })}
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                                    placeholder="customer@example.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Product Selection */}
                    {step === 2 && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 md:p-8 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-brand-600" />
                                    Step 2: Add Products
                                </h3>
                                <div className="space-y-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search products by name..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                        />
                                        {products.length > 0 && (
                                            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl max-h-96 overflow-y-auto">
                                                {products.map(p => (
                                                    <div key={p.id} className="border-b border-slate-50 dark:border-slate-700 last:border-none p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <img src={p.images?.[0]} className="w-12 h-12 rounded-lg object-cover" />
                                                                <div>
                                                                    <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                                                                    <p className="text-sm text-slate-500">{formatPrice(p.price)} | Stock: {p.stock}</p>
                                                                </div>
                                                            </div>
                                                            {(!p.variants || p.variants.length === 0) && (
                                                                <button
                                                                    onClick={() => addItem(p)}
                                                                    className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        {p.variants && p.variants.length > 0 && p.variants.map(v => (
                                                            <div key={v.id} className="mt-2 ml-12 flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                                    {v.combination ? Object.values(v.combination).join(' / ') : v.sku}
                                                                    <span className="ml-2 font-bold">({formatPrice(Number(v.price))})</span>
                                                                </span>
                                                                <button
                                                                    onClick={() => addItem(p, v)}
                                                                    className="p-1.5 bg-brand-100 text-brand-600 rounded-lg hover:bg-brand-200"
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {selectedItems.map((item, index) => (
                                            <div key={`${item.product.id}-${item.variant?.id}`} className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl">
                                                <img src={item.product.images?.[0]} className="w-16 h-16 rounded-xl object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900 dark:text-white">{item.product.name}</p>
                                                    {item.variant && (
                                                        <p className="text-xs text-slate-500">
                                                            {Object.values(item.variant.combination).join(' / ')}
                                                        </p>
                                                    )}
                                                    <div className="mt-1 flex items-center gap-4">
                                                        <span className="text-sm font-bold text-brand-600">{formatPrice(item.unitPrice - item.discountAmount)}</span>
                                                        {item.discountAmount > 0 && (
                                                            <span className="text-xs text-slate-400 line-through">{formatPrice(item.unitPrice)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                        <button onClick={() => updateQuantity(index, -1)} className="text-slate-500 hover:text-brand-600">
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(index, 1)} className="text-slate-500 hover:text-brand-600">
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removeItem(index)} className="p-2 text-slate-400 hover:text-red-500">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedItems.length > 0 && (
                                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Coupon code"
                                                    value={appliedCouponCode}
                                                    onChange={e => setAppliedCouponCode(e.target.value.toUpperCase())}
                                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={isValidatingCoupon || !appliedCouponCode}
                                                    className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl disabled:opacity-50"
                                                >
                                                    {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Shipping */}
                    {step === 3 && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 md:p-8 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-brand-600" />
                                    Step 3: Shipping Info
                                </h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Detailed Address</label>
                                        <textarea
                                            rows={4}
                                            value={shippingData.address}
                                            onChange={e => setShippingData({ ...shippingData, address: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                            placeholder="House #, Street #, City, Area..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Order Notes (Optional)</label>
                                        <textarea
                                            rows={2}
                                            value={shippingData.notes}
                                            onChange={e => setShippingData({ ...shippingData, notes: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                                            placeholder="Any special instructions..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Final Confirmation */}
                    {step === 4 && (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 md:p-8 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Check className="w-5 h-5 text-green-500" />
                                    Final Confirmation
                                </h3>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Customer</p>
                                            <p className="font-bold text-slate-900 dark:text-white">{selectedCustomer?.name || manualCustomer.name}</p>
                                            <p className="text-sm text-slate-500">{selectedCustomer?.phone || manualCustomer.phone}</p>
                                            <p className="text-sm text-slate-500">{selectedCustomer?.email || manualCustomer.email || 'No email'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Shipping Address</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{shippingData.address}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Payment</p>
                                            <div className="flex items-center gap-2 text-brand-600">
                                                <Truck className="w-4 h-4" />
                                                <span className="font-bold">Manual / Cash on Delivery</span>
                                            </div>
                                        </div>
                                        {shippingData.notes && (
                                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Notes</p>
                                                <p className="text-sm text-slate-500 italic">"{shippingData.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex justify-between">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl flex items-center gap-2"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Back
                            </button>
                        ) : <div />}

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
                            >
                                Next Step
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-12 py-3 bg-brand-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Sidebar: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm p-6 sticky top-24 border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-brand-600" />
                            Order Summary
                        </h3>

                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedItems.length === 0 ? (
                                <p className="text-center text-slate-400 py-8 italic">No items added yet</p>
                            ) : (
                                selectedItems.map((item, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex-shrink-0 overflow-hidden">
                                            <img src={item.product.images?.[0]} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                                            <p className="text-xs text-slate-500">Qty: {item.quantity} × {formatPrice(item.unitPrice - item.discountAmount)}</p>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(item.totalAmount)}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-3">
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            {totalProductDiscount > 0 && (
                                <div className="flex justify-between text-red-500">
                                    <span>Product Discount</span>
                                    <span>-{formatPrice(totalProductDiscount)}</span>
                                </div>
                            )}
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <div className="flex items-center gap-1">
                                        <Tag className="w-3.5 h-3.5" />
                                        <span>Coupon ({appliedCouponCode})</span>
                                    </div>
                                    <span>-{formatPrice(couponDiscount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                <span>Shipping</span>
                                <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                                <span className="text-2xl font-bold text-brand-600 font-display">{formatPrice(payable)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
