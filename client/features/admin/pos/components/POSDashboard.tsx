'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { Search, Plus, Minus, Trash2, User, CreditCard, Banknote, ShoppingCart, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
    id: string;
    name: string;
    price: number;
    discountAmount?: number;
    taxRate?: number;
    stock: number;
    images?: string[];
    variants?: any[];
}

interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    name: string;
    price: number;
    discountAmount: number;
    taxAmount: number;
    stock: number;
    cartQuantity: number;
}

export default function POSDashboard() {
    const { formatPrice } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('Walk-in Customer');
    const [customerPhone, setCustomerPhone] = useState('01700000000');
    const [customerEmail, setCustomerEmail] = useState('');
    const [appliedCouponCode, setAppliedCouponCode] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sslcommerz'>('cod');
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const [prodRes, custRes] = await Promise.all([
                    fetchAPI('/products?limit=100'),
                    fetchAPI('/users?limit=100')
                ]);
                if (prodRes.data?.products) setProducts(prodRes.data.products);
                if (custRes.data?.users) setCustomers(custRes.data.users);
            } catch (err) {
                toast.error('Failed to load POS data');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [products, searchQuery]);

    const addToCart = (product: Product, variant?: any) => {
        if (product.variants && product.variants.length > 0 && !variant) {
            setSelectedProductForVariant(product);
            return;
        }

        setCart(prev => {
            const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
            const existing = prev.find(item => item.id === cartItemId);
            
            const variantStock = variant ? variant.stock : product.stock;
            const variantPrice = variant?.price ?? product.price;

            if (existing) {
                if (existing.cartQuantity >= variantStock) {
                    toast.error('Not enough stock limit');
                    return prev;
                }
                return prev.map(item => item.id === cartItemId ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
            }

            if (variantStock < 1) {
                toast.error('Out of stock');
                return prev;
            }

            const variantNameSuffix = variant ? ` - ${Object.values(variant.combination).join(' / ')}` : '';
            const discountAmt = Number(product.discountAmount) || 0;
            const discountedPrice = variantPrice - discountAmt;
            const taxAmt = (discountedPrice * (Number(product.taxRate) || 0)) / 100;

            return [...prev, { 
                id: cartItemId,
                productId: product.id,
                variantId: variant?.id,
                name: product.name + variantNameSuffix,
                price: variantPrice,
                discountAmount: discountAmt,
                taxAmount: taxAmt,
                stock: variantStock,
                cartQuantity: 1 
            }];
        });
        
        if (variant) {
            setSelectedProductForVariant(null);
            toast.success('Variant added to cart');
        }
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQ = item.cartQuantity + delta;
                if (newQ > item.stock) {
                    toast.error('Stock limit reached');
                    return item;
                }
                if (newQ < 1) return item;
                return { ...item, cartQuantity: newQ };
            }
            return item;
        }));
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const cartSubtotal = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
    }, [cart]);

    const totalProductDiscount = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.discountAmount * item.cartQuantity), 0);
    }, [cart]);

    const totalTax = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.taxAmount * item.cartQuantity), 0);
    }, [cart]);

    const finalTotal = useMemo(() => {
        const total = cartSubtotal - totalProductDiscount - couponDiscount + totalTax;
        return Math.max(0, total);
    }, [cartSubtotal, totalProductDiscount, couponDiscount, totalTax]);

    const handleApplyCoupon = async () => {
        if (!appliedCouponCode) return;
        setIsValidatingCoupon(true);
        try {
            const res = await fetchAPI(`/coupons/validate/${appliedCouponCode}?amount=${cartSubtotal - totalProductDiscount}`);
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

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error('Cart is empty');
        if (!customerName || !customerPhone) return toast.error('Customer details required');

        setIsProcessing(true);
        try {
            const payload = {
                userId: selectedCustomerId || undefined,
                customerName,
                customerPhone,
                ...(customerEmail && { customerEmail }),
                address: 'In Store',
                paymentMethod,
                appliedCouponCode: appliedCouponCode || undefined,
                items: cart.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.cartQuantity
                }))
            };

            const res = await fetchAPI('/orders/pos', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.success) {
                setOrderSuccess(true);
                toast.success('Order completed successfully!');
            } else {
                toast.error(res.message || 'Failed to process order');
            }
        } catch (error) {
            toast.error('Error during checkout');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNewOrder = () => {
        setCart([]);
        setOrderSuccess(false);
        setCustomerName('Walk-in Customer');
        setCustomerPhone('01700000000');
        setCustomerEmail('');
        setSelectedCustomerId('');
        setAppliedCouponCode('');
        setCouponDiscount(0);
    };

    useEffect(() => {
        if (selectedCustomerId) {
            const c = customers.find(x => x.id === selectedCustomerId);
            if (c) {
                setCustomerName(c.name || 'Customer');
                setCustomerPhone(c.phone || '01700000000');
                setCustomerEmail(c.email || '');
            }
        }
    }, [selectedCustomerId, customers]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading POS...</div>;
    }

    if (orderSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-lg mx-auto mt-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white mb-2">Order Completed!</h2>
                <p className="text-slate-500 text-center mb-8">The POS transaction was successful and the payment has been recorded.</p>
                <div className="flex gap-4 w-full">
                    <button onClick={handleNewOrder} className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all">
                        New Order
                    </button>
                    <button onClick={() => window.print()} className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-2xl font-bold transition-all">
                        Print Receipt
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6 relative">
            {/* Variant Modal */}
            {selectedProductForVariant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-6 shadow-xl border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Select Variant</h3>
                            <button onClick={() => setSelectedProductForVariant(null)} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-full text-slate-500">
                                ✕
                            </button>
                        </div>
                        <div className="text-sm text-slate-500 mb-4">{selectedProductForVariant.name}</div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {selectedProductForVariant.variants?.map(variant => (
                                <button
                                    key={variant.id}
                                    onClick={() => addToCart(selectedProductForVariant, variant)}
                                    disabled={variant.stock < 1}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                                        variant.stock < 1 
                                            ? 'opacity-50 cursor-not-allowed border-slate-100 dark:border-slate-800' 
                                            : 'border-slate-200 hover:border-brand-500 dark:border-slate-700 dark:hover:border-brand-500'
                                    }`}
                                >
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                                            {Object.values(variant.combination).join(' / ')}
                                        </div>
                                        <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md inline-block">
                                            Stock: {variant.stock}
                                        </div>
                                    </div>
                                    <div className="font-black text-brand-600 text-lg">
                                        {formatPrice(variant.price ?? selectedProductForVariant.price)}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Left: Products Grid */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => {
                            const price = product.discountAmount ? product.price - product.discountAmount : product.price;
                            return (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="flex flex-col text-left p-3 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-brand-500 transition-colors bg-slate-50 dark:bg-slate-900 group relative"
                                >
                                    <div className="w-full aspect-square bg-white dark:bg-slate-800 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <ShoppingCart className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">{product.name}</h3>
                                    <div className="mt-auto pt-2 flex items-center justify-between w-full">
                                        <span className="text-brand-600 font-black">{formatPrice(price)}</span>
                                        <span className="text-[10px] text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{product.stock} left</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="w-[400px] flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Current Order</h2>
                        <p className="text-xs text-slate-500 font-medium">{cart.length} items</p>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map(item => {
                        const price = item.discountAmount ? item.price - item.discountAmount : item.price;
                        return (
                            <div key={item.id} className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</h4>
                                    <div className="text-xs text-brand-600 font-bold">{formatPrice(price)}</div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 shadow-sm rounded-md"><Minus className="w-3 h-3" /></button>
                                    <span className="w-6 text-center text-sm font-bold">{item.cartQuantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 shadow-sm rounded-md"><Plus className="w-3 h-3" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })}
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center gap-3 opacity-50">
                            <ShoppingCart className="w-12 h-12" />
                            <p className="text-sm font-medium">Cart is empty.<br/>Click products to add.</p>
                        </div>
                    )}
                </div>

                {/* Checkout Section */}
                <div className="border-t border-slate-100 dark:border-slate-700 p-5 space-y-4 bg-slate-50 dark:bg-slate-900/50">
                    
                    {/* Customer Selection */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</span>
                        </div>
                        <select 
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                        >
                            <option value="">Walk-in Customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name || c.email} - {c.phone}</option>
                            ))}
                        </select>
                        {!selectedCustomerId && (
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none" />
                                    <input type="text" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none" />
                                </div>
                                <input type="email" placeholder="Email (Optional)" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none" />
                            </div>
                        )}
                    </div>

                    {/* Coupons */}
                    <div className="mt-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Coupon</span>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={appliedCouponCode} 
                                onChange={e => setAppliedCouponCode(e.target.value.toUpperCase())} 
                                placeholder="Enter code" 
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none uppercase" 
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={isValidatingCoupon || !appliedCouponCode || cart.length === 0}
                                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg disabled:opacity-50"
                            >
                                {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setPaymentMethod('cod')}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'}`}
                        >
                            <Banknote className="w-5 h-5" />
                            <span className="text-xs font-bold">Cash</span>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('sslcommerz')}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${paymentMethod === 'sslcommerz' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'}`}
                        >
                            <CreditCard className="w-5 h-5" />
                            <span className="text-xs font-bold">Card (Online)</span>
                        </button>
                    </div>

                    <div className="pt-2 space-y-1 px-1">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span className="font-bold text-slate-900 dark:text-white">{formatPrice(cartSubtotal)}</span>
                        </div>
                        {totalProductDiscount > 0 && (
                            <div className="flex items-center justify-between text-sm text-red-500">
                                <span>Product Discount</span>
                                <span className="font-bold">-{formatPrice(totalProductDiscount)}</span>
                            </div>
                        )}
                        {couponDiscount > 0 && (
                            <div className="flex items-center justify-between text-sm text-green-600">
                                <span>Coupon ({appliedCouponCode})</span>
                                <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                            </div>
                        )}
                        {totalTax > 0 && (
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <span>Estimated Tax</span>
                                <span className="font-bold">{formatPrice(totalTax)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                            <span className="text-sm font-bold text-slate-500">Total Amount</span>
                            <span className="text-2xl font-black text-brand-600 font-display leading-none">{formatPrice(finalTotal)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:dark:bg-slate-700 text-white rounded-2xl font-black tracking-wide flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-brand-500/25"
                    >
                        {isProcessing ? 'PROCESSING...' : 'COMPLETE PAY'}
                    </button>
                </div>
            </div>
        </div>
    );
}
