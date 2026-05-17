'use client';

import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Banknote,
  Coins,
  CreditCard,
  DollarSign,
  History,
  LayoutGrid,
  Loader2,
  Minus,
  Percent,
  Plus,
  Printer,
  QrCode,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
  ChevronDown
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Register {
  id: string;
  name: string;
  branchId?: string;
}

interface PosShift {
  id: string;
  registerId: string;
  userId: string;
  openingBalance: number;
  cashSales: number;
  cardSales: number;
  mobileSales: number;
  expectedClosingBalance: number;
  closingBalance?: number;
  status: 'OPEN' | 'CLOSED';
  openedAt: string;
  closedAt?: string;
  register?: Register;
}

interface ProductVariant {
  id: string;
  price?: number;
  combination: Record<string, string>;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  stock: number;
  price: number;
  images?: string[];
  variants?: ProductVariant[];
}

interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

export default function Pos() {
  // Session / Shift state
  const [loadingShift, setLoadingShift] = useState(true);
  const [activeShift, setActiveShift] = useState<PosShift | null>(null);
  const [registers, setRegisters] = useState<Register[]>([]);
  const [selectedRegisterId, setSelectedRegisterId] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number | ''>(1000);
  const [submittingShift, setSubmittingShift] = useState(false);

  // Billing & Catalog state
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE'>('CASH');
  const [amountTendered, setAmountTendered] = useState<number | ''>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Advanced features: Customer, discount and receipt
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  // Premium POS Coupons State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<any | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Premium POS Delivery Zones & Custom Shipping Address State
  const [deliveryZone, setDeliveryZone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // Close shift modal
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [closingBalance, setClosingBalance] = useState<number | ''>('');
  const [closingRemarks, setClosingRemarks] = useState('');

  // 1. Initial mounting checks
  useEffect(() => {
    checkActiveShift();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkActiveShift = async () => {
    setLoadingShift(true);
    try {
      const res = await fetchAPI('/pos/shift/active');
      if (res.success && res.data) {
        setActiveShift(res.data);
        fetchProducts();
        fetchCategoriesAndBrands();
      }
    } catch {
      // Shift not found, load registers for opening till
      fetchRegisters();
    } finally {
      setLoadingShift(false);
    }
  };

  const fetchRegisters = async () => {
    try {
      const res = await fetchAPI('/pos/register');
      if (res.success) {
        setRegisters(res.data || []);
        if (res.data.length > 0) {
          setSelectedRegisterId(res.data[0].id);
        }
      }
    } catch {
      toast.error('Failed to load register terminals');
    }
  };

  const fetchCategoriesAndBrands = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetchAPI('/categories/stats'),
        fetchAPI('/brands/stats'),
      ]);
      if (catRes.success) {
        setCategories(catRes.data || []);
      }
      if (brandRes.success) {
        setBrands(brandRes.data || []);
      }
    } catch {
      toast.error('Failed to load categories or brands');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetchAPI('/products?limit=50&status=active');
      if (res.success) {
        setProducts(res.data || []);
      }
    } catch {
      toast.error('Failed to load store products');
    }
  };

  // 2. Shift Management Actions
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegisterId) {
      toast.error('Please select a register terminal');
      return;
    }
    setSubmittingShift(true);
    try {
      const res = await fetchAPI('/pos/shift/open', {
        method: 'POST',
        body: JSON.stringify({
          registerId: selectedRegisterId,
          openingBalance: Number(openingBalance || 0),
        }),
      });
      if (res.success) {
        toast.success('Drawer register opened successfully!');
        setActiveShift(res.data);
        fetchProducts();
        fetchCategoriesAndBrands();
      }
    } catch (error) {
      toast.error((error as { message?: string })?.message || 'Error opening till');
    } finally {
      setSubmittingShift(false);
    }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (closingBalance === '') {
      toast.error('Please input actual audited cash balance');
      return;
    }
    setSubmittingShift(true);
    try {
      const res = await fetchAPI(`/pos/shift/${activeShift?.id || ''}/close`, {
        method: 'POST',
        body: JSON.stringify({
          closingBalance: Number(closingBalance),
          remarks: closingRemarks,
        }),
      });
      if (res.success) {
        toast.success('Register Shift safely audited and closed!');
        setActiveShift(null);
        setIsCloseShiftOpen(false);
        setClosingBalance('');
        setClosingRemarks('');
        setCart([]);
        fetchRegisters();
      }
    } catch {
      toast.error('Error closing counter till');
    } finally {
      setSubmittingShift(false);
    }
  };

  // 3. Cart & Sales Management
  const addToCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProductForVariant(product);
      setSelectedVariant(product.variants[0]);
      return;
    }
    executeAddToCart(product);
  };

  const executeAddToCart = (product: Product, variant?: ProductVariant) => {
    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && item.variant?.id === variant?.id
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          variant,
          quantity: 1,
          price: Number(product.price),
        },
      ]);
    }
    toast.success(`${product.name} added to cart`, { duration: 1000 });
  };

  const updateQuantity = (index: number, delta: number) => {
    const updatedCart = [...cart];
    const newQty = updatedCart[index].quantity + delta;
    if (newQty <= 0) {
      updatedCart.splice(index, 1);
    } else {
      updatedCart[index].quantity = newQty;
    }
    setCart(updatedCart);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const fetchCustomers = async (q = '') => {
    setLoadingCustomers(true);
    try {
      const res = await fetchAPI(`/customer?q=${q}&limit=10`);
      if (res.success && res.data) {
        setCustomers(res.data.items || []);
      }
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    if (activeShift) {
      fetchCustomers();
    }
  }, [activeShift]);

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Premium Coupon Handlers
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await fetchAPI('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderTotal: calculateSubtotal()
        })
      });
      if (res.success && res.data?.valid) {
        setCouponApplied({
          code: res.data.coupon.code,
          discountAmount: res.data.discountAmount
        });
        toast.success(`Coupon "${couponCode.trim().toUpperCase()}" applied successfully!`);
      } else {
        toast.error(res.message || 'Invalid or expired coupon code');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const calculateCouponDiscount = () => {
    return couponApplied ? Number(couponApplied.discountAmount || 0) : 0;
  };

  // Premium Delivery Config
  const DELIVERY_ZONES = [
    { name: 'Store Counter Pickup', fee: 0 },
    { name: 'Inside City Zone (Standard)', fee: 60 },
    { name: 'Inside City Zone (Express)', fee: 100 },
    { name: 'Outside City Zone (Standard)', fee: 120 },
    { name: 'Outside City Zone (Express)', fee: 180 },
  ];

  const calculateShippingFee = () => {
    const zone = DELIVERY_ZONES.find((z) => z.name === deliveryZone);
    return zone ? Number(zone.fee) : 0;
  };

  const calculateDiscountValue = () => {
    const subtotal = calculateSubtotal();
    return discountType === 'PERCENT' ? (subtotal * discount) / 100 : discount;
  };

  const calculateTaxableAmount = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscountValue() - calculateCouponDiscount());
  };

  const calculateTax = () => {
    return calculateTaxableAmount() * 0.05; // 5% flat VAT
  };

  const calculateGrandTotal = () => {
    return calculateTaxableAmount() + calculateTax() + calculateShippingFee();
  };

  const changeDue = amountTendered !== '' ? Number(amountTendered) - calculateGrandTotal() : 0;

  // 4. Sales Sync Processing
  const handleConfirmCheckout = async () => {
    if (paymentMethod === 'CASH' && amountTendered !== '' && Number(amountTendered) < calculateGrandTotal()) {
      toast.error('Tendered cash must equal or exceed total payable amount');
      return;
    }

    setProcessingPayment(true);
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        variantId: item.variant?.id || undefined,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await fetchAPI('/pos/sync', {
        method: 'POST',
        body: JSON.stringify({
          shiftId: activeShift?.id || '',
          items: itemsPayload,
          paymentMethod,
          paymentAmount: calculateGrandTotal(),
          customerId: selectedCustomer?.id || undefined,
          appliedCoupon: couponApplied?.code || undefined,
          couponDiscountAmount: calculateCouponDiscount(),
          deliveryZone: deliveryZone || undefined,
          shippingFee: calculateShippingFee(),
          shippingAddress: shippingAddress || undefined,
        }),
      });

      if (res.success) {
        toast.success('Sale synced successfully & General Ledger journaled! 🧾');
        
        // Save transaction details for receipt modal
        setLastTransaction({
          receiptNo: `REC-${Date.now().toString().slice(-6)}`,
          date: new Date().toLocaleString(),
          items: [...cart],
          subtotal: calculateSubtotal(),
          discount: calculateDiscountValue(),
          couponDiscount: calculateCouponDiscount(),
          couponCode: couponApplied?.code || null,
          shippingFee: calculateShippingFee(),
          deliveryZone: deliveryZone || null,
          tax: calculateTax(),
          grandTotal: calculateGrandTotal(),
          paymentMethod,
          amountTendered: amountTendered === '' ? calculateGrandTotal() : Number(amountTendered),
          changeDue: changeDue > 0 ? changeDue : 0,
          customer: selectedCustomer,
        });

        setCart([]);
        setIsCheckoutOpen(false);
        setAmountTendered('');
        setDiscount(0);
        setCouponApplied(null);
        setCouponCode('');
        setDeliveryZone('');
        setShippingAddress('');
        setSelectedCustomer(null);
        setIsReceiptOpen(true); // Open premium receipt modal

        // Reload shift stats
        const activeRes = await fetchAPI('/pos/shift/active');
        if (activeRes.success) setActiveShift(activeRes.data);
      }
    } catch {
      toast.error('Failed to sync POS transaction');
    } finally {
      setProcessingPayment(false);
    }
  };

  const filteredProducts = products.filter((p: any) => {
    // 1. Text search query
    const matchesQuery =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Category filter
    const matchesCategory =
      !selectedCategoryId ||
      p.categoryId === selectedCategoryId ||
      p.category_id === selectedCategoryId ||
      p.category?.id === selectedCategoryId;

    // 3. Brand filter
    const matchesBrand =
      !selectedBrandId ||
      p.brandId === selectedBrandId ||
      p.brand_id === selectedBrandId ||
      p.brand?.id === selectedBrandId;

    return matchesQuery && matchesCategory && matchesBrand;
  });

  // loading view
  if (loadingShift) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-slate-800 dark:text-white animate-spin" />
        <p className="text-sm font-bold text-slate-500">Checking Active Drawer Sessions...</p>
      </div>
    );
  }

  // 1. FRONT OPEN TILL VIEW (NO ACTIVE SHIFT)
  if (!activeShift) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl p-8">
        <div className="flex flex-col items-center gap-3 text-center mb-8">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-full">
            <Coins className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Open Counter Till</h2>
          <p className="text-xs text-slate-500 font-medium max-w-[280px]">
            Please sign in to a physical register terminal and state your opening cash balance to log shifts.
          </p>
        </div>

        <form onSubmit={handleOpenShift} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Select Terminal Register</label>
            <select
              value={selectedRegisterId}
              onChange={(e) => setSelectedRegisterId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-sm"
            >
              {registers.length === 0 ? (
                <option value="">No Register Terminals Available</option>
              ) : (
                registers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} - Scoped Branch ID: {r.branchId?.substring(0, 8)}...
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Opening Till Balance</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                min="0"
                required
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-extrabold text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingShift || registers.length === 0}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submittingShift ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Banknote className="w-5 h-5" />
            )}
            Audit Cash & Open Shift
          </button>
        </form>
      </div>
    );
  }

  // 2. ACTIVE BILLING SCREEN
  return (
    <div className="flex flex-col gap-6 -mt-4">
      {/* Header Stat Panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
            <Coins className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-black text-lg">Active Terminal Shift</h3>
            <p className="text-xs text-slate-400 font-medium">
              Terminal: <span className="font-bold text-white">{activeShift.register?.name}</span> | Cashier ID:{' '}
              <span className="font-bold text-white">{activeShift.userId?.substring(0, 8)}...</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex gap-6">
            <div className="text-center md:text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drawer Base</p>
              <p className="font-black text-sm">${activeShift.openingBalance}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center md:text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash Intake</p>
              <p className="font-black text-sm text-emerald-400">+${activeShift.cashSales}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center md:text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expected Balance</p>
              <p className="font-black text-sm text-brand-400">${activeShift.expectedClosingBalance}</p>
            </div>
          </div>

          <button
            onClick={() => setIsCloseShiftOpen(true)}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg transition-all"
          >
            Audit & Close Till
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left billing cart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col h-[75vh]">
          {/* Cart Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <ShoppingCart className="w-4 h-4 text-slate-800 dark:text-white" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-base">Active Cart</h4>
            </div>
            <span className="px-2.5 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-extrabold rounded-lg">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} Items
            </span>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-extrabold text-slate-500">Cart is Empty</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                  Click on catalog items to build checkout bills
                </p>
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">
                      {item.product.name}
                    </p>
                    {item.variant && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {Object.entries(item.variant.combination || {})
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' / ')}
                      </p>
                    )}
                    <p className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-1">
                      ${item.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-black text-sm text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Selection Block */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20">
            <div className="relative">
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-black text-emerald-900 dark:text-emerald-350">{selectedCustomer.name}</p>
                      <p className="text-[9px] font-bold text-emerald-650 dark:text-emerald-500">{selectedCustomer.phone || selectedCustomer.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg text-emerald-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Link customer profile..."
                      value={customerSearchQuery}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        fetchCustomers(e.target.value);
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl outline-none font-bold text-xs"
                    />
                    {customerSearchQuery && (
                      <button
                        onClick={() => {
                          setCustomerSearchQuery('');
                          fetchCustomers('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {showCustomerDropdown && (
                    <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1">
                      <div className="flex justify-between items-center px-2 py-1 border-b border-slate-50 dark:border-slate-850">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Search Results</span>
                        <button onClick={() => setShowCustomerDropdown(false)} className="text-[9px] font-black text-brand-500">Close</button>
                      </div>
                      {loadingCustomers ? (
                        <p className="text-[10px] text-slate-400 text-center py-2">Searching customers...</p>
                      ) : customers.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-2">No matching customers found</p>
                      ) : (
                        customers.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedCustomer(c);
                              setShowCustomerDropdown(false);
                              setCustomerSearchQuery('');
                            }}
                            className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-all"
                          >
                            <p className="text-xs font-black text-slate-800 dark:text-white">{c.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">{c.phone || c.email}</p>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Discount Block */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-400">
                <Percent className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-wider">Discount</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="flex-1 px-3 py-1.5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none font-bold text-xs"
                />
                <select
                  value={discountType}
                  onChange={(e: any) => setDiscountType(e.target.value)}
                  className="px-2 py-1.5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-white rounded-xl outline-none font-bold text-xs"
                >
                  <option value="FIXED">Flat ($)</option>
                  <option value="PERCENT">Percent (%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Coupon Code Promo Block */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-400">
                <Percent className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-wider">Promo Coupon</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  disabled={!!couponApplied}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-1.5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none font-black text-xs placeholder:text-slate-350"
                />
                {couponApplied ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-650 font-bold rounded-xl text-xs transition-all"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={validatingCoupon || !couponCode.trim()}
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    {validatingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                  </button>
                )}
              </div>
            </div>
            {couponApplied && (
              <div className="flex justify-between items-center text-[10px] font-bold text-emerald-500 pt-1.5 pl-5">
                <span>Code Applied: {couponApplied.code}</span>
                <span>-${calculateCouponDiscount().toFixed(2)} off</span>
              </div>
            )}
          </div>

          {/* Cart Pricing summary footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-4 rounded-b-3xl">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  ${calculateSubtotal().toFixed(2)}
                </span>
              </div>
              {calculateDiscountValue() > 0 && (
                <div className="flex justify-between text-xs text-emerald-500 font-bold">
                  <span>In-store Discount</span>
                  <span>-${calculateDiscountValue().toFixed(2)}</span>
                </div>
              )}
              {calculateCouponDiscount() > 0 && (
                <div className="flex justify-between text-xs text-emerald-500 font-bold">
                  <span>Promo Coupon Discount</span>
                  <span>-${calculateCouponDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>VAT / Flat Tax (5%)</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  ${calculateTax().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Grand Total</span>
                <span className="text-brand-600 dark:text-brand-400 font-black">
                  ${calculateGrandTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" /> Collect Checkout Pay
            </button>
          </div>
        </div>

        {/* Right catalog grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col h-[75vh]">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search products by name, code, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-sm shadow-sm"
            />
          </div>

          {/* Filters by Category and Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs font-bold border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-brand-500 shadow-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="relative">
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs font-bold border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-2 focus:ring-brand-500 shadow-sm appearance-none cursor-pointer transition-all"
              >
                <option value="">All Brands</option>
                {brands.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Grid Catalog list */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8">
                <LayoutGrid className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-sm font-extrabold text-slate-500">No Catalog Matches</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                  Adjust your search filters or check server stock synchronization
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-500 hover:shadow-lg rounded-xl text-left transition-all gap-1.5 group"
                  >
                    <div className="w-full aspect-square rounded-lg bg-slate-50 dark:bg-slate-950 overflow-hidden border border-slate-100/60 dark:border-slate-850 flex items-center justify-center relative">
                      {p.images?.[0] ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-slate-300 dark:text-slate-750">
                          <ShoppingCart className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {p.name}
                      </p>
                      <div className="flex justify-between items-center gap-1">
                        <span className="font-black text-xs text-brand-650 dark:text-brand-400">
                          ${p.price}
                        </span>
                        <span className="text-[8px] font-bold px-1 py-0.5 bg-slate-50 dark:bg-slate-850 rounded text-slate-500">
                          Qty: {p.stock}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. CHEKOUT MODAL */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Collect Payment</h3>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Method selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('CASH')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border gap-1.5 transition-all font-bold text-xs ${paymentMethod === 'CASH'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-650'
                        }`}
                    >
                      <Banknote className="w-4 h-4" /> Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod('CARD')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border gap-1.5 transition-all font-bold text-xs ${paymentMethod === 'CARD'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-650'
                        }`}
                    >
                      <CreditCard className="w-4 h-4" /> Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod('MOBILE')}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border gap-1.5 transition-all font-bold text-xs ${paymentMethod === 'MOBILE'
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                        : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-650'
                        }`}
                    >
                      <QrCode className="w-4 h-4" /> Mobile
                    </button>
                  </div>
                </div>

                {/* Delivery Zone and Shipping Address Selector */}
                <div className="space-y-3 p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Delivery Zone / Shipping Channel
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      {DELIVERY_ZONES.map((zone) => (
                        <option key={zone.name} value={zone.name}>
                          {zone.name} {zone.fee > 0 ? `(+$${zone.fee})` : '(Free Counter Pickup)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {deliveryZone && deliveryZone !== 'Store Counter Pickup' && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Delivery/Shipping Address
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Enter customer's full shipping address..."
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl outline-none focus:ring-1 focus:ring-brand-500 resize-none placeholder:text-slate-350"
                      />
                    </div>
                  )}
                </div>

                {/* Amount details */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Cart Total (Incl. Tax)</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      ${(calculateTaxableAmount() + calculateTax()).toFixed(2)}
                    </span>
                  </div>
                  {calculateShippingFee() > 0 && (
                    <div className="flex justify-between text-xs text-emerald-500 font-bold">
                      <span>Delivery Shipping Fee</span>
                      <span>+${calculateShippingFee().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-850">
                    <span>Grand Payable Total</span>
                    <span className="text-brand-600 dark:text-brand-400 font-black">
                      ${calculateGrandTotal().toFixed(2)}
                    </span>
                  </div>

                  {paymentMethod === 'CASH' && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Amount Tendered</span>
                        <input
                          type="number"
                          value={amountTendered}
                          onChange={(e) =>
                            setAmountTendered(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          placeholder="0.00"
                          className="w-28 text-right px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-black text-sm text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Cash denomination buttons */}
                      <div className="pt-2">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Quick Tender Cash</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setAmountTendered(calculateGrandTotal())}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg text-slate-700 dark:text-white transition-all text-center"
                          >
                            Exact Cash
                          </button>
                          {[5, 10, 20, 50, 100].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAmountTendered(val)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] font-black rounded-lg text-slate-700 dark:text-white transition-all text-center"
                            >
                              ${val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-slate-500 pt-1">
                        <span>Change Due</span>
                        <span
                          className={`font-black text-sm ${changeDue >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
                        >
                          ${changeDue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processingPayment}
                  onClick={handleConfirmCheckout}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-black rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  {processingPayment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Coins className="w-4 h-4" />
                  )}
                  Process Complete sale
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SHIFT CLOSE / TILL AUDIT MODAL */}
      <AnimatePresence>
        {isCloseShiftOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Audit & Close Till</h3>
                <button
                  onClick={() => setIsCloseShiftOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCloseShift}>
                <div className="p-6 space-y-5">
                  {/* Stats list */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Opening Base Cash</span>
                      <span className="font-bold text-slate-850 dark:text-white">
                        ${activeShift.openingBalance}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>Cash Sales Collected</span>
                      <span className="font-bold text-emerald-500">
                        +${activeShift.cashSales}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span>Expected Drawer Cash</span>
                      <span className="text-brand-500 font-black">
                        ${activeShift.expectedClosingBalance}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Actual Audited Cash Count
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={closingBalance}
                      onChange={(e) =>
                        setClosingBalance(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none font-extrabold text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {closingBalance !== '' && (
                    <div className="flex justify-between items-center text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                      <span className="font-bold text-slate-650 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-red-500 animate-bounce" /> Variance (Difference)
                      </span>
                      <span
                        className={`font-black ${Number(closingBalance) - activeShift.expectedClosingBalance === 0 ? 'text-emerald-500' : 'text-red-500'}`}
                      >
                        ${(Number(closingBalance) - activeShift.expectedClosingBalance).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Shift remarks
                    </label>
                    <textarea
                      placeholder="Audit details, cash discrepancies reasons..."
                      value={closingRemarks}
                      onChange={(e) => setClosingRemarks(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none text-xs text-slate-900 dark:text-white h-20 resize-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCloseShiftOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingShift}
                    className="px-6 py-2.5 bg-red-650 hover:bg-red-750 text-white font-black rounded-xl shadow-lg flex items-center gap-2"
                  >
                    {submittingShift ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <History className="w-4 h-4" />
                    )}
                    Complete Audit & Close
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. VARIANT SELECTOR MINI-MODAL */}
      <AnimatePresence>
        {selectedProductForVariant && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Select Variation
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {selectedProductForVariant.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProductForVariant(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  {selectedProductForVariant.variants?.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${selectedVariant?.id === v.id
                        ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-650'
                        }`}
                    >
                      {Object.entries(v.combination || {})
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(' / ')}{' '}
                      (${v.price || selectedProductForVariant.price})
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2.5">
                <button
                  onClick={() => setSelectedProductForVariant(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-850 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    executeAddToCart(
                      selectedProductForVariant,
                      selectedVariant || undefined
                    );
                    setSelectedProductForVariant(null);
                  }}
                  className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-xl"
                >
                  Add Selection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. THERMAL RECEIPT PRINT MODAL */}
      <AnimatePresence>
        {isReceiptOpen && lastTransaction && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Transaction Success</h3>
                </div>
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Receipt Area (Stylized POS Layout) */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20 max-h-[60vh] font-mono text-xs text-slate-800 dark:text-slate-300">
                <div id="thermal-receipt" className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm space-y-4">
                  {/* Store Info */}
                  <div className="text-center space-y-1">
                    <h2 className="text-base font-black tracking-wider uppercase text-slate-900 dark:text-white">STORE REGISTER</h2>
                    <p className="text-[10px] text-slate-400">Terminal: {activeShift?.register?.name || 'Counter 1'}</p>
                    <p className="text-[9px] text-slate-400">Date: {lastTransaction.date}</p>
                    <p className="text-[9px] text-slate-400">Receipt: {lastTransaction.receiptNo}</p>
                  </div>

                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                  {/* Customer Info if linked */}
                  {lastTransaction.customer && (
                    <div className="space-y-0.5 text-[10px]">
                      <p className="font-bold text-slate-900 dark:text-white">Customer Profile:</p>
                      <p>Name: {lastTransaction.customer.name}</p>
                      <p>Phone: {lastTransaction.customer.phone || 'N/A'}</p>
                    </div>
                  )}

                  {lastTransaction.customer && <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />}

                  {/* Item Rows */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-black text-slate-900 dark:text-white text-[10px]">
                      <span>Item Description</span>
                      <span>Total</span>
                    </div>
                    {lastTransaction.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start text-[10px] leading-tight">
                        <div className="min-w-0 pr-4">
                          <p className="font-bold text-slate-850 dark:text-slate-350 truncate">{item.product.name}</p>
                          {item.variant && (
                            <p className="text-[8px] text-slate-450 font-sans">
                              {Object.entries(item.variant.combination || {}).map(([k, v]) => `${k}:${v}`).join('/')}
                            </p>
                          )}
                          <p className="text-[9px] text-slate-450">{item.quantity} x ${item.price.toFixed(2)}</p>
                        </div>
                        <span className="font-black text-slate-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                  {/* Totals Summary */}
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${lastTransaction.subtotal.toFixed(2)}</span>
                    </div>
                    {lastTransaction.discount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>Discount Deducted</span>
                        <span>-${lastTransaction.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>VAT Tax (5%)</span>
                      <span>${lastTransaction.tax.toFixed(2)}</span>
                    </div>
                    {lastTransaction.couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>Coupon ({lastTransaction.couponCode})</span>
                        <span>-${lastTransaction.couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {lastTransaction.shippingFee > 0 && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>Shipping ({lastTransaction.deliveryZone})</span>
                        <span>+${lastTransaction.shippingFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      <span>Grand Total</span>
                      <span>${lastTransaction.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                  {/* Payment Tender details */}
                  <div className="space-y-1 text-[9px] text-slate-455">
                    <div className="flex justify-between">
                      <span>Payment Mode</span>
                      <span className="font-bold uppercase">{lastTransaction.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Collected</span>
                      <span>${lastTransaction.amountTendered.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-slate-350">
                      <span>Change Given Back</span>
                      <span>${lastTransaction.changeDue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800" />

                  {/* Footer message */}
                  <div className="text-center text-[9px] text-slate-400 pt-2 space-y-1 leading-tight">
                    <p className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">Thank You for your visit!</p>
                    <p>Receipt generated via Automated Accounting Engine</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850 flex gap-3">
                <button
                  onClick={() => setIsReceiptOpen(false)}
                  className="flex-1 py-2.5 bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition-all"
                >
                  Close Receipt
                </button>
                <button
                  onClick={() => {
                    const printContent = document.getElementById('thermal-receipt')?.innerHTML;
                    if (printContent) {
                      const printWindow = window.open('', '_blank', 'width=300,height=600');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Receipt</title>
                              <style>
                                body { font-family: monospace; padding: 15px; font-size: 11px; max-width: 280px; margin: 0 auto; color: #000; }
                                .text-center { text-align: center; }
                                .space-y-1 > * { margin-bottom: 2px; }
                                .space-y-2 > * { margin-bottom: 4px; }
                                .flex { display: flex; }
                                .justify-between { justify-content: space-between; }
                                .border-dashed { border-bottom: 1px dashed #000; margin: 10px 0; }
                                .font-black { font-weight: bold; }
                                .text-sm { font-size: 12px; }
                                .text-base { font-size: 14px; }
                              </style>
                            </head>
                            <body>
                              \${printContent}
                              <script>
                                window.onload = function() { window.print(); window.close(); }
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      }
                    }
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Thermal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
