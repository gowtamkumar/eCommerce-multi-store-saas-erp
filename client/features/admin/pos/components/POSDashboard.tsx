'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchAPI } from '@/services/api';
import { useSettings } from '@/hooks/SettingsContext';
import { Search, Plus, Minus, Trash2, User, CreditCard, Banknote, ShoppingCart, CheckCircle, Loader2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    price: number;
    discountAmount?: number;
    discountType?: string;
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
    const [isSearching, setIsSearching] = useState(false);
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
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
    const [isCustomerExpanded, setIsCustomerExpanded] = useState(false);

    // Initial Load for customers and default products
    useEffect(() => {
        const init = async () => {
            try {
                const [prodRes, custRes] = await Promise.all([
                    fetchAPI('/products?limit=50'),
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

    // Debounced search for products
    useEffect(() => {
        if (searchQuery.length > 1) {
            setIsSearching(true);
            const timer = setTimeout(async () => {
                try {
                    const res = await fetchAPI(`/products?search=${searchQuery}`);
                    if (res.data?.products) {
                        setProducts(res.data.products);
                    }
                } catch (err) {
                    toast.error('Search failed');
                } finally {
                    setIsSearching(false);
                }
            }, 300);
            return () => clearTimeout(timer);
        } else if (searchQuery.length === 0) {
            // Restore default view if empty
            fetchAPI('/products?limit=50').then(res => {
                if (res.data?.products) setProducts(res.data.products);
            });
        }
    }, [searchQuery]);

    const addToCart = (product: Product, variant?: any) => {
        if (product.variants && product.variants.length > 0 && !variant) {
            setSelectedProductForVariant(product);
            return;
        }

        if (appliedCouponCode || couponDiscount > 0) {
            setAppliedCouponCode('');
            setCouponDiscount(0);
            toast('Cart changed, coupon removed. Please re-apply.', { id: 'coupon-reset' });
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

            let discountAmt = 0;
            const rawDiscount = Number(product.discountAmount) || 0;
            if (product.discountType === 'PERCENTAGE' || product.discountType === 'percentage') {
                discountAmt = (variantPrice * rawDiscount) / 100;
            } else {
                discountAmt = rawDiscount;
            }

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
        }
        toast.success(`Added ${product.name} to cart`);
    };

    const updateQuantity = (id: string, delta: number) => {
        if (appliedCouponCode || couponDiscount > 0) {
            setAppliedCouponCode('');
            setCouponDiscount(0);
            toast('Cart changed, coupon removed. Please re-apply.', { id: 'coupon-reset' });
        }

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
        if (appliedCouponCode || couponDiscount > 0) {
            setAppliedCouponCode('');
            setCouponDiscount(0);
            toast('Cart changed, coupon removed. Please re-apply.', { id: 'coupon-reset' });
        }
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
        setIsCustomerExpanded(false);
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
        <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
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
                        <div className="text-sm font-bold text-slate-900 dark:text-white mb-4">{selectedProductForVariant.name}</div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {selectedProductForVariant.variants?.map(variant => {
                                const variantPrice = variant.price ?? selectedProductForVariant.price;
                                let discountAmt = 0;
                                const rawDiscount = Number(selectedProductForVariant.discountAmount) || 0;
                                const isPercentage = selectedProductForVariant.discountType === 'PERCENTAGE' || selectedProductForVariant.discountType === 'percentage';
                                if (isPercentage) {
                                    discountAmt = (variantPrice * rawDiscount) / 100;
                                } else {
                                    discountAmt = rawDiscount;
                                }
                                const discountedPrice = variantPrice - discountAmt;
                                const hasDiscount = discountAmt > 0;
                                const taxRate = Number(selectedProductForVariant.taxRate) || 0;
                                const taxAmt = (discountedPrice * taxRate) / 100;
                                const finalPrice = discountedPrice + taxAmt;

                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => addToCart(selectedProductForVariant, variant)}
                                        disabled={variant.stock < 1}
                                        className={`w-full flex-col p-4 rounded-2xl border-2 transition-all text-left ${variant.stock < 1
                                            ? 'opacity-50 cursor-not-allowed border-slate-100 dark:border-slate-800'
                                            : 'border-slate-200 hover:border-brand-500 dark:border-slate-700 dark:hover:border-brand-500 bg-slate-50 dark:bg-slate-900/50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="font-bold text-slate-900 dark:text-white text-base">
                                                {Object.values(variant.combination).join(' / ')}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                                    Stock: {variant.stock}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-xs text-slate-500 space-y-1 w-full bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between w-full">
                                                <span>Base Price:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">{formatPrice(variantPrice)}</span>
                                            </div>
                                            {hasDiscount && (
                                                <div className="flex justify-between w-full text-brand-600">
                                                    <span>Discount {isPercentage ? `(${rawDiscount}%)` : ''}:</span>
                                                    <span>-{formatPrice(discountAmt)}</span>
                                                </div>
                                            )}
                                            {taxRate > 0 && (
                                                <div className="flex justify-between w-full text-red-500">
                                                    <span>Tax ({taxRate}%):</span>
                                                    <span>+{formatPrice(taxAmt)}</span>
                                                </div>
                                            )}
                                            <div className="h-px w-full bg-slate-100 dark:bg-slate-700 my-1" />
                                            <div className="flex justify-between w-full font-black text-slate-900 dark:text-white text-sm">
                                                <span>Final Price:</span>
                                                <span>{formatPrice(finalPrice)}</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Left/Sidebar: Products Grid */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-10 w-full min-w-0">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-white dark:bg-slate-800 sticky top-0 z-20">
                    <Link href="/admin" className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0" title="Back to Dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search products by name or SKU..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-500 animate-spin" />
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 md:p-3 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 mx-auto pb-24 lg:pb-0">
                        {products.map(p => {
                            let baseDiscountAmt = 0;
                            const rawDiscount = Number(p.discountAmount) || 0;
                            const isPercentage = p.discountType === 'PERCENTAGE' || p.discountType === 'percentage';
                            if (isPercentage) {
                                baseDiscountAmt = (p.price * rawDiscount) / 100;
                            } else {
                                baseDiscountAmt = rawDiscount;
                            }
                            const baseDiscountedPrice = p.price - baseDiscountAmt;
                            const hasDiscount = baseDiscountAmt > 0;
                            const taxRate = Number(p.taxRate) || 0;
                            const taxAmt = (baseDiscountedPrice * taxRate) / 100;
                            const finalPrice = baseDiscountedPrice + taxAmt;

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => addToCart(p)}
                                    disabled={p.stock < 1 && (!p.variants || p.variants.length === 0)}
                                    className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm hover:border-brand-500 dark:hover:border-brand-500 transition-colors text-left flex flex-col ${p.stock < 1 && (!p.variants || p.variants.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="w-full aspect-square bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg mb-2 overflow-hidden flex items-center justify-center relative">
                                        {hasDiscount && (
                                            <div className="absolute top-1.5 left-1.5 z-10 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded shadow-sm">
                                                {isPercentage ? `-${rawDiscount}%` : 'SALE'}
                                            </div>
                                        )}
                                        {p.images?.[0] ? (
                                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <ShoppingCart className="w-6 h-6 text-slate-300" />
                                        )}
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight min-h-[32px] mb-1.5">{p.name}</h3>

                                    <div className="mt-auto w-full group relative">
                                        <div className="flex items-center justify-between mt-0.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-brand-600 font-black text-sm">{formatPrice(finalPrice)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                                            <span className="truncate pr-1">{p.variants?.length ? 'Options' : `Stock: ${p.stock}`}</span>
                                            {(hasDiscount || taxRate > 0) && (
                                                <span className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 decoration-dotted shrink-0">Details</span>
                                            )}
                                        </div>

                                        {/* Hover Tooltip Breakdown */}
                                        {(hasDiscount || taxRate > 0) && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl shadow-xl text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                                <div className="flex justify-between w-full mb-1">
                                                    <span className="text-slate-300 dark:text-slate-500">Base:</span>
                                                    <span className="font-medium">{formatPrice(p.price)}</span>
                                                </div>
                                                {hasDiscount && (
                                                    <div className="flex justify-between w-full mb-1 text-green-400 dark:text-brand-500">
                                                        <span>Dis {isPercentage ? `(${rawDiscount}%)` : ''}:</span>
                                                        <span>-{formatPrice(baseDiscountAmt)}</span>
                                                    </div>
                                                )}
                                                {taxRate > 0 && (
                                                    <div className="flex justify-between w-full mb-1 text-red-400 dark:text-red-500">
                                                        <span>Tax ({taxRate}%):</span>
                                                        <span>+{formatPrice(taxAmt)}</span>
                                                    </div>
                                                )}
                                                <div className="h-px bg-slate-700 dark:bg-slate-200 my-1"></div>
                                                <div className="flex justify-between w-full font-bold">
                                                    <span>Final:</span>
                                                    <span>{formatPrice(finalPrice)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        {products.length === 0 && !isSearching && (
                            <div className="text-center py-20 col-span-full">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No products found for "{searchQuery}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile View Cart FAB */}
            <div className="lg:hidden fixed bottom-6 right-6 z-30">
                <button 
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-3.5 rounded-full shadow-2xl transition-transform active:scale-95"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-bold text-sm tracking-wide">
                        {cart.length > 0 ? `${cart.length} ITEMS` : 'VIEW CART'}
                    </span>
                    {cart.length > 0 && (
                        <span className="ml-1 flex items-center bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                            {formatPrice(cart.reduce((total, item) => total + ((item.price - item.discountAmount + item.taxAmount) * item.cartQuantity), 0))}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile Overlay for Cart Drawer */}
            {isCartOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity" 
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Right: Cart & Checkout Sidebar (Responsive Drawer) */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] lg:w-[450px] lg:static lg:block flex-col bg-white dark:bg-slate-800 shadow-2xl lg:shadow-xl lg:border-l lg:border-slate-200 lg:dark:border-slate-700 shrink-0 h-full transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} flex`}>
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden p-2 -ml-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500" onClick={() => setIsCartOpen(false)}>
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Current Order</h2>
                            <p className="text-xs text-slate-500 font-medium">{cart.length} items</p>
                        </div>
                    </div>
                    {cart.length > 0 && (
                        <div className="flex items-center gap-1">
                            <button onClick={handleNewOrder} title="Clear Cart" className="p-2 gap-2 text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors">
                                <Trash2 className="w-4 h-4" />
                                Clear
                            </button>
                        </div>
                    )}
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
                            <p className="text-sm font-medium">Cart is empty.<br />Click products to add.</p>
                        </div>
                    )}
                </div>

                {/* Checkout Section */}
                <div className="border-t border-slate-100 dark:border-slate-700 p-5 space-y-4 bg-slate-50 dark:bg-slate-900/50">

                    {/* Customer Selection (Collapsible) */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setIsCustomerExpanded(!isCustomerExpanded)}
                            className="w-full p-3 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-500" />
                                <div className="text-left leading-tight">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Customer</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] block">
                                        {selectedCustomerId ? customerName : 'Walk-in Customer'}
                                    </span>
                                </div>
                            </div>
                            {isCustomerExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {isCustomerExpanded && (
                            <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Search Existing User</label>
                                    <select
                                        value={selectedCustomerId}
                                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none appearance-none"
                                    >
                                        <option value="">Walk-in Customer</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name || c.email} - {c.phone}</option>
                                        ))}
                                    </select>
                                </div>
                                {!selectedCustomerId && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">New Walk-In Details</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none" />
                                            <input type="text" placeholder="Phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none" />
                                        </div>
                                        <input type="email" placeholder="Email (Optional)" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none" />
                                    </div>
                                )}
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
