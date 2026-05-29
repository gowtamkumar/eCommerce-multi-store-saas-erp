'use client';

import Pagination from '@/components/shared/Pagination';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Banknote,
  ChevronDown,
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
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  User,
  Wallet,
  X
} from 'lucide-react';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type {
  Brand,
  CartItem,
  Category,
  CouponApplied,
  Customer,
  OfflineSale,
  PosShift,
  Product,
  ProductVariant,
  Register,
  ReturnOrder,
  TaxRule,
  TransactionHistory,
  TransactionItem
} from '../type';

const DENOMINATIONS = [
  { label: '$100', value: 100, type: 'bill' },
  { label: '$50', value: 50, type: 'bill' },
  { label: '$20', value: 20, type: 'bill' },
  { label: '$10', value: 10, type: 'bill' },
  { label: '$5', value: 5, type: 'bill' },
  { label: '$1', value: 1, type: 'bill' },
  { label: '¢25', value: 0.25, type: 'coin' },
  { label: '¢10', value: 0.10, type: 'coin' },
  { label: '¢5', value: 0.05, type: 'coin' },
  { label: '¢1', value: 0.01, type: 'coin' },
];

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Pagination & Search States
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productPagination, setProductPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1
  });
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [selectedProductForVariant, setSelectedProductForVariant] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'on_account' | 'wallet'>('cash');
  const [amountTendered, setAmountTendered] = useState<number | ''>('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Offline state
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineSale[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Split payment state
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState<{ cash: number | ''; card: number | ''; mobile: number | ''; on_account: number | '' }>({
    cash: '',
    card: '',
    mobile: '',
    on_account: '',
  });

  // Cash drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTxType, setDrawerTxType] = useState<'CASH_IN' | 'CASH_OUT'>('CASH_IN');
  const [drawerAmount, setDrawerAmount] = useState<number | ''>('');
  const [drawerReason, setDrawerReason] = useState('');
  const [submittingDrawerTx, setSubmittingDrawerTx] = useState(false);

  // Advanced features: Customer, discount and receipt
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<TransactionHistory | null>(null);

  // Premium POS Coupons State
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<CouponApplied | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Premium POS Delivery Zones & Custom Shipping Address State
  const [deliveryZone, setDeliveryZone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  // POS dynamic tax states
  const [taxRate, setTaxRate] = useState<number>(5);
  const [taxName, setTaxName] = useState<string>('VAT / Flat Tax');

  // Wallet and credit states
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [outstandingBalance, setOutstandingBalance] = useState<number>(0);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletAmountToUse, setWalletAmountToUse] = useState<number | ''>('');

  // Close shift modal
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [closingBalance, setClosingBalance] = useState<number | ''>('');
  const [closingRemarks, setClosingRemarks] = useState('');
  const [showDenoCalc, setShowDenoCalc] = useState(false);
  const [denoCounts, setDenoCounts] = useState<Record<string, number>>({
    '100': 0,
    '50': 0,
    '20': 0,
    '10': 0,
    '5': 0,
    '1': 0,
    '0.25': 0,
    '0.10': 0,
    '0.05': 0,
    '0.01': 0,
  });

  // POS Return/Exchange states
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState('');
  const [searchingOrder, setSearchingOrder] = useState(false);
  const [returnOrder, setReturnOrder] = useState<ReturnOrder | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState('Customer exchange');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Helper to generate local transaction UUIDs
  const generateUUID = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const getRemainingPayableAmount = () => {
    const walletDeduction = useWalletBalance && walletAmountToUse !== '' ? Number(walletAmountToUse) : 0;
    return Math.max(0, calculateGrandTotal() - walletDeduction);
  };

  const getSplitPaymentsSum = () => {
    return (
      Number(splitPayments.cash || 0) +
      Number(splitPayments.card || 0) +
      Number(splitPayments.mobile || 0) +
      (selectedCustomer ? Number(splitPayments.on_account || 0) : 0)
    );
  };

  const fetchTaxRules = async () => {
    try {
      const res = await fetchAPI('/finance/tax/rules');
      if (res.success && res.data && Array.isArray(res.data)) {
        const rules = res.data as TaxRule[];
        const activeRule = rules.find((r) => r.isActive && r.category === 'STANDARD') || rules.find((r) => r.isActive);
        if (activeRule) {
          setTaxRate(Number(activeRule.rate));
          setTaxName(activeRule.name);
        }
      }
    } catch (err) {
      console.error('Failed to load active tax rules:', err);
    }
  };

  // 1. Initial mounting checks
  useEffect(() => {
    checkActiveShift();
    fetchTaxRules();
    if (typeof window !== 'undefined') {
      setIsOnline(window.navigator.onLine);
      const savedQueue = localStorage.getItem('pos_offline_queue');
      if (savedQueue) {
        try {
          setOfflineQueue(JSON.parse(savedQueue));
        } catch (e) {
          console.error(e);
        }
      }

      const handleOnline = () => {
        setIsOnline(true);
        toast.success('Internet connection restored!');
      };
      const handleOffline = () => {
        setIsOnline(false);
        toast.error('Working offline mode activated.');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist offline queue
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_offline_queue', JSON.stringify(offlineQueue));
    }
  }, [offlineQueue]);

  // Sync offline queue helper
  const syncOfflineQueue = async (forceQueue?: OfflineSale[]) => {
    const queueToProcess = forceQueue || offlineQueue;
    if (queueToProcess.length === 0) return;

    setIsSyncing(true);
    const updatedQueue = [...queueToProcess];
    let successCount = 0;
    let failedCount = 0;

    for (const sale of queueToProcess) {
      try {
        const res = await fetchAPI('/pos/sync', {
          method: 'POST',
          body: JSON.stringify({
            shiftId: sale.shiftId,
            items: sale.items,
            paymentMethod: sale.paymentMethod,
            paymentAmount: sale.paymentAmount,
            customerId: sale.customerId,
            appliedCoupon: sale.appliedCoupon,
            couponDiscountAmount: sale.couponDiscountAmount,
            deliveryZone: sale.deliveryZone,
            shippingFee: sale.shippingFee,
            shippingAddress: sale.shippingAddress,
            useWalletBalance: sale.useWalletBalance,
            walletAmountToUse: sale.walletAmountToUse,
            offlineSaleId: sale.offlineSaleId,
            createdAt: sale.createdAt,
            payments: sale.payments,
          }),
        });

        if (res.success) {
          successCount++;
          const idx = updatedQueue.findIndex((q) => q.offlineSaleId === sale.offlineSaleId);
          if (idx > -1) updatedQueue.splice(idx, 1);
        } else {
          failedCount++;
          console.error('Failed syncing offline sale:', res.message);
        }
      } catch (err: unknown) {
        console.error('Network error during offline sync:', err);
        toast.error('Sync failed due to network connection issues.');
        break;
      }
    }

    setOfflineQueue(updatedQueue);
    if (successCount > 0) {
      toast.success(`Successfully synced ${successCount} offline sale(s)!`);
      try {
        const activeRes = await fetchAPI('/pos/shift/active');
        if (activeRes.success) setActiveShift(activeRes.data);
      } catch (e: unknown) {
        console.error('Failed to refresh shift after sync:', e);
      }
    }
    if (failedCount > 0) {
      toast.error(`Failed to sync ${failedCount} sale(s) due to validation errors.`);
    }
    setIsSyncing(false);
  };

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && !isSyncing) {
      syncOfflineQueue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const checkActiveShift = async () => {
    setLoadingShift(true);
    try {
      const res = await fetchAPI('/pos/shift/active');
      if (res.success && res.data) {
        setActiveShift(res.data);
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

  const fetchProducts = useCallback(
    async (
      page = 1,
      search = '',
      categoryId = '',
      brandId = ''
    ) => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: productPagination.limit.toString(),
          status: 'active',
        });
        if (search.trim()) params.append('q', search.trim());
        if (categoryId) params.append('categoryId', categoryId);
        if (brandId) params.append('brandId', brandId);

        const res = await fetchAPI(`/products?${params}`);
        if (res.success) {
          setProducts(res.data || []);
          if (res.pagination) {
            setProductPagination({
              total: res.pagination.total,
              page: res.pagination.page,
              limit: res.pagination.limit,
              totalPages: res.pagination.totalPages
            });
          }
        }
      } catch (error) {
        console.error('Failed to load store products', error);
        toast.error('Failed to load store products');
      } finally {
        setLoadingProducts(false);
      }
    },
    [productPagination.limit]
  );

  const handleProductPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= productPagination.totalPages) {
      fetchProducts(newPage, debouncedSearchQuery, selectedCategoryId, selectedBrandId);
    }
  };

  useEffect(() => {
    if (activeShift) {
      fetchProducts(1, debouncedSearchQuery, selectedCategoryId, selectedBrandId);
    }
  }, [activeShift, debouncedSearchQuery, selectedCategoryId, selectedBrandId, fetchProducts]);

  // POS Return & Exchange Handlers
  const handleSearchReturnOrder = async () => {
    if (!returnOrderId.trim()) {
      toast.error('Please enter an Order ID or Invoice Code');
      return;
    }
    setSearchingOrder(true);
    setReturnOrder(null);
    setReturnQuantities({});
    try {
      // First try by ID
      const res = await fetchAPI(`/orders/${returnOrderId.trim()}`);
      if (res.success && res.data) {
        setReturnOrder(res.data);
        return;
      }
    } catch {
      // ignore & fallback to list search
    }

    try {
      const res = await fetchAPI(`/orders?limit=5&page=1&search=${encodeURIComponent(returnOrderId.trim())}`);
      if (res.success && res.data && res.data.orders && res.data.orders.length > 0) {
        setReturnOrder(res.data.orders[0]);
      } else {
        toast.error('No order found matching this reference');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to search order';
      toast.error(message);
    } finally {
      setSearchingOrder(false);
    }
  };

  const handleSubmitPOSReturn = async (isExchange: boolean) => {
    if (!returnOrder) return;
    const itemsToReturn = Object.entries(returnQuantities)
      .map(([itemId, qty]) => {
        const orderItem = returnOrder.items.find((item) => item.id === itemId);
        return {
          productId: orderItem.productId,
          variantId: orderItem.variantId || undefined,
          quantity: qty,
        };
      })
      .filter((item) => item.quantity > 0);

    if (itemsToReturn.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    setSubmittingReturn(true);
    try {
      const res = await fetchAPI('/returns', {
        method: 'POST',
        body: JSON.stringify({
          orderId: returnOrder.id,
          reason: returnReason,
          returnType: isExchange ? 'exchange' : 'refund',
          items: itemsToReturn,
        }),
      });

      if (res.success && res.data) {
        const returnId = res.data.id;

        // Auto-approve the return & issue refund to register customer's wallet
        await fetchAPI(`/returns/${returnId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'approved', comment: 'Approved automatically at POS register' }),
        });

        await fetchAPI(`/returns/${returnId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'refunded', comment: 'Refunded automatically at POS register' }),
        });

        toast.success('Return processed. Refund credited to store credit.');

        if (isExchange) {
          const refundAmount = Number(res.data.refundAmount || 0);

          if (returnOrder.user) {
            setSelectedCustomer(returnOrder.user);
            fetchAPI(`/finance/wallet/${returnOrder.user.id}`)
              .then((walletRes) => {
                if (walletRes.success && walletRes.data) {
                  setWalletBalance(Number(walletRes.data.balance || 0));
                  setUseWalletBalance(true);
                  setWalletAmountToUse(refundAmount);
                  toast.success(`Exchange Mode: Applied $${refundAmount.toFixed(2)} store credit. Now ring up the new items.`);
                }
              });
          } else {
            // Guest/walk-in customer: exchange cannot be done via store credit.
            // Show clear guidance to cashier.
            toast.success(
              `Walk-in exchange: The return of $${refundAmount.toFixed(2)} has been processed. Please issue a CASH or CARD refund and ring up the exchange items as a new sale.`,
              { duration: 8000 }
            );
          }
        }

        setIsReturnOpen(false);
        setReturnOrder(null);
        setReturnQuantities({});
      } else {
        toast.error(res.message || 'Failed to submit return');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error processing return';
      toast.error(message);
    } finally {
      setSubmittingReturn(false);
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

  const handleDrawerTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerAmount || Number(drawerAmount) <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    if (!activeShift) {
      toast.error('No active cashier shift found');
      return;
    }
    setSubmittingDrawerTx(true);
    try {
      const res = await fetchAPI(`/pos/shift/${activeShift.id}/drawer-transaction`, {
        method: 'POST',
        body: JSON.stringify({
          type: drawerTxType,
          amount: Number(drawerAmount),
          reason: drawerReason || undefined,
        }),
      });
      if (res.success) {
        toast.success(`Drawer transaction (${drawerTxType}) recorded successfully!`);
        setIsDrawerOpen(false);
        setDrawerAmount('');
        setDrawerReason('');
        // Reload active shift to get updated aggregates (cashIn, cashOut, expectedClosingBalance)
        const activeRes = await fetchAPI('/pos/shift/active');
        if (activeRes.success) {
          setActiveShift(activeRes.data);
        }
      } else {
        toast.error(res.message || 'Failed to submit drawer transaction');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error recording drawer transaction';
      toast.error(message);
    } finally {
      setSubmittingDrawerTx(false);
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

  const executeAddToCart = useCallback((product: Product, variant?: ProductVariant) => {
    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex(
        (item) => item.product.id === product.id && item.variant?.id === variant?.id
      );

      if (existingIndex > -1) {
        const updatedCart = [...currentCart];
        updatedCart[existingIndex].quantity += 1;
        return updatedCart;
      }

      return [
        ...currentCart,
        {
          product,
          variant,
          quantity: 1,
          price: Number(product.price),
        },
      ];
    });

    toast.success(`${product.name} added to cart`, { duration: 1000 });
  }, []);

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

  const playBeepSound = useCallback(() => {
    try {
      const windowWithAudio = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioCtxConstructor = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
      if (!AudioCtxConstructor) {
        throw new Error('AudioContext is not supported');
      }
      const audioCtx = new AudioCtxConstructor();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz beep
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e: unknown) {
      console.warn('AudioContext beep blocked or not supported:', e);
    }
  }, []);

  const findAndAddProductByCode = useCallback(async (query: string, rawQuery: string): Promise<boolean> => {
    // 1. Check local products first
    let matchedProduct: Product | null = null;
    let matchedVariant: ProductVariant | null = null;

    for (const p of products) {
      if (
        (p.sku && p.sku.toLowerCase() === query) ||
        (p.barcode && p.barcode.toLowerCase() === query)
      ) {
        matchedProduct = p;
        break;
      }

      if (p.variants && p.variants.length > 0) {
        const v = p.variants.find(
          (varItem) =>
            (varItem.sku && varItem.sku.toLowerCase() === query) ||
            (varItem.barcode && varItem.barcode.toLowerCase() === query)
        );
        if (v) {
          matchedProduct = p;
          matchedVariant = v;
          break;
        }
      }
    }

    if (matchedProduct) {
      executeAddToCart(matchedProduct, matchedVariant || undefined);
      playBeepSound();
      return true;
    }

    // 2. Fetch from backend if not found locally
    try {
      const res = await fetchAPI(`/products?q=${encodeURIComponent(query)}&limit=1&status=active`);
      if (res.success && res.data && res.data.length > 0) {
        const p = res.data[0];
        let v: ProductVariant | undefined;
        if (p.variants && p.variants.length > 0) {
          v = p.variants.find(
            (varItem: ProductVariant) =>
              (varItem.sku && varItem.sku.toLowerCase() === query) ||
              (varItem.barcode && varItem.barcode.toLowerCase() === query)
          );
        }
        executeAddToCart(p, v);
        playBeepSound();
        return true;
      }
    } catch (err: unknown) {
      console.error('Error looking up product on backend:', err);
    }

    toast.error(`No product found matching code: "${rawQuery}"`);
    return false;
  }, [products, executeAddToCart, playBeepSound]);

  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return;

      const success = await findAndAddProductByCode(query, searchQuery);
      if (success) {
        setSearchQuery('');
      }
      e.preventDefault();
    }
  };

  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT') &&
        activeEl.id !== 'pos-product-search'
      ) {
        return;
      }

      const currentTime = Date.now();

      if (currentTime - lastKeyTime > 50) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length > 2) {
          const query = buffer.trim().toLowerCase();
          const rawQuery = buffer.trim();
          findAndAddProductByCode(query, rawQuery);
          buffer = '';
          e.preventDefault();
          e.stopPropagation();
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [findAndAddProductByCode]);

  useEffect(() => {
    if (!selectedCustomer) {
      setWalletBalance(0);
      setOutstandingBalance(0);
      setUseWalletBalance(false);
      setWalletAmountToUse('');
      if (paymentMethod === 'on_account' || paymentMethod === 'wallet') {
        setPaymentMethod('cash');
      }
    }
  }, [selectedCustomer, paymentMethod]);

  // Fetch outstanding AR balance whenever customer changes (wallet is fetched on-demand when WALLET method is selected)
  useEffect(() => {
    if (selectedCustomer) {
      fetchAPI(`/finance/ar/customer/${selectedCustomer.id}`)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            const outstanding = (res.data as Array<{ amount: number | string }>).reduce(
              (sum: number, entry) => sum + Number(entry.amount),
              0
            );
            setOutstandingBalance(outstanding);
          }
        })
        .catch(() => setOutstandingBalance(0));
    }
  }, [selectedCustomer]);

  // Reset denomination calculator when modal closes
  useEffect(() => {
    if (!isCloseShiftOpen) {
      setShowDenoCalc(false);
      setDenoCounts({
        '100': 0,
        '50': 0,
        '20': 0,
        '10': 0,
        '5': 0,
        '1': 0,
        '0.25': 0,
        '0.10': 0,
        '0.05': 0,
        '0.01': 0,
      });
    }
  }, [isCloseShiftOpen]);

  // Dynamically calculate closingBalance when denomination counts or showDenoCalc change
  useEffect(() => {
    if (showDenoCalc) {
      const total = Object.entries(denoCounts).reduce((acc, [valueStr, count]) => {
        const val = parseFloat(valueStr);
        return acc + val * count;
      }, 0);
      setClosingBalance(Number(total.toFixed(2)));
    }
  }, [denoCounts, showDenoCalc]);

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const calculateCatalogDiscount = () => {
    return cart.reduce((acc, item) => {
      const discAmt = Number(item.product.discountAmount || 0);
      if (discAmt <= 0) return acc;
      const discType = item.product.discountType || 'fixed';
      const unitDiscountedPrice = discType === 'percentage' ? item.price * (1 - discAmt / 100) : item.price - discAmt;
      const discountPerUnit = item.price - Math.max(0, unitDiscountedPrice);
      return acc + discountPerUnit * item.quantity;
    }, 0);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to validate coupon';
      toast.error(message);
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
    const subtotal = calculateSubtotal() - calculateCatalogDiscount();
    return discountType === 'PERCENT' ? (subtotal * discount) / 100 : discount;
  };

  const calculateTax = () => {
    return cart.reduce((sum, item) => {
      const rawTax = item.product.taxRate;
      const itemTaxRate = rawTax !== undefined && rawTax !== null && !isNaN(Number(rawTax)) ? Number(rawTax) : taxRate;

      const subtotal = calculateSubtotal() - calculateCatalogDiscount();
      const totalDiscount = calculateDiscountValue() + calculateCouponDiscount();

      const discAmt = Number(item.product.discountAmount || 0);
      const discType = item.product.discountType || 'fixed';
      const unitDiscountedPrice = discType === 'percentage' ? item.price * (1 - discAmt / 100) : item.price - discAmt;

      const itemSubtotal = Math.max(0, unitDiscountedPrice) * item.quantity;
      const itemDiscount = subtotal > 0 ? (itemSubtotal / subtotal) * totalDiscount : 0;

      const itemTaxableAmount = Math.max(0, itemSubtotal - itemDiscount);
      const itemTax = (itemTaxableAmount * itemTaxRate) / 100;
      return sum + itemTax;
    }, 0);
  };

  const calculateTaxableAmount = () => {
    const netAmount = Math.max(0, calculateSubtotal() - calculateCatalogDiscount() - calculateDiscountValue() - calculateCouponDiscount());
    return netAmount;
  };

  const calculateGrandTotal = () => {
    const netAmount = Math.max(0, calculateSubtotal() - calculateCatalogDiscount() - calculateDiscountValue() - calculateCouponDiscount());
    return netAmount + calculateTax() + calculateShippingFee();
  };

  const changeDue = amountTendered !== '' ? Number(amountTendered) - calculateGrandTotal() : 0;

  // 4. Sales Sync Processing
  const handleConfirmCheckout = async () => {
    // 1. Validation
    const remainingAmount = getRemainingPayableAmount();

    let payments: { method: 'cash' | 'card' | 'mobile' | 'on_account'; amount: number }[] | undefined = undefined;

    if (splitPayment) {
      const sum = getSplitPaymentsSum();
      if (Math.abs(sum - remainingAmount) > 0.01) {
        toast.error(`Split payments total ($${sum.toFixed(2)}) must equal remaining payable amount ($${remainingAmount.toFixed(2)})`);
        return;
      }
      if (Number(splitPayments.on_account || 0) > 0 && !selectedCustomer) {
        toast.error('Customer profile selection required for on-account split checkout');
        return;
      }

      payments = [];
      if (Number(splitPayments.cash || 0) > 0) payments.push({ method: 'cash', amount: Number(splitPayments.cash) });
      if (Number(splitPayments.card || 0) > 0) payments.push({ method: 'card', amount: Number(splitPayments.card) });
      if (Number(splitPayments.mobile || 0) > 0) payments.push({ method: 'mobile', amount: Number(splitPayments.mobile) });
      if (selectedCustomer && Number(splitPayments.on_account || 0) > 0) {
        payments.push({ method: 'on_account', amount: Number(splitPayments.on_account) });
      }
    } else {
      if (paymentMethod === 'on_account' && !selectedCustomer) {
        toast.error('Customer profile selection required for on-account checkout');
        return;
      }
      if (paymentMethod === 'cash' && amountTendered !== '' && Number(amountTendered) < remainingAmount) {
        toast.error('Tendered cash must equal or exceed remaining payable amount');
        return;
      }
    }

    const offlineSaleId = generateUUID();
    const createdAt = new Date().toISOString();
    const itemsPayload = cart.map((item) => ({
      productId: item.product.id,
      variantId: item.variant?.id || undefined,
      quantity: item.quantity,
      price: item.price,
    }));

    // When WALLET is selected, auto-enable wallet deduction from the amount input
    const isWalletPayment = !splitPayment && paymentMethod === 'wallet';
    const resolvedUseWallet = isWalletPayment ? true : useWalletBalance;
    const resolvedWalletAmount = isWalletPayment
      ? (walletAmountToUse !== '' ? Number(walletAmountToUse) : undefined)
      : (useWalletBalance && walletAmountToUse !== '' ? Number(walletAmountToUse) : undefined);

    const salePayload = {
      shiftId: activeShift?.id || '',
      items: itemsPayload,
      paymentMethod: splitPayment ? 'cash' : paymentMethod, // main default method
      paymentAmount: calculateGrandTotal(),
      customerId: selectedCustomer?.id || undefined,
      appliedCoupon: couponApplied?.code || undefined,
      couponDiscountAmount: calculateCouponDiscount() + calculateDiscountValue(),
      deliveryZone: deliveryZone || undefined,
      shippingFee: calculateShippingFee(),
      shippingAddress: shippingAddress || undefined,
      useWalletBalance: resolvedUseWallet || undefined,
      walletAmountToUse: resolvedWalletAmount,
      offlineSaleId,
      createdAt,
      payments,
    };

    setProcessingPayment(true);

    if (!isOnline) {
      // offline flow
      try {
        const queuedSale = {
          ...salePayload,
          _metadata: {
            customerName: selectedCustomer?.name || 'Walk-in Customer',
            grandTotal: calculateGrandTotal(),
            itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
          }
        };
        setOfflineQueue((prev) => [...prev, queuedSale]);
        toast.success('Offline mode: Sale queued for synchronization!');

        // Show success receipt
        setLastTransaction({
          receiptNo: `OFF-${offlineSaleId.slice(-6).toUpperCase()}`,
          date: new Date(createdAt).toLocaleString(),
          items: [...cart],
          subtotal: calculateSubtotal(),
          catalogDiscount: calculateCatalogDiscount(),
          discount: calculateDiscountValue(),
          couponDiscount: calculateCouponDiscount(),
          couponCode: couponApplied?.code || null,
          shippingFee: calculateShippingFee(),
          deliveryZone: deliveryZone || null,
          tax: calculateTax(),
          grandTotal: calculateGrandTotal(),
          paymentMethod: splitPayment ? 'SPLIT' : paymentMethod,
          amountTendered: splitPayment
            ? Number(splitPayments.cash || 0)
            : (amountTendered === '' ? remainingAmount : Number(amountTendered)),
          changeDue: splitPayment
            ? 0
            : (paymentMethod === 'cash' && amountTendered !== '' ? Number(amountTendered) - remainingAmount : 0),
          walletDeduction: useWalletBalance && walletAmountToUse !== '' ? Number(walletAmountToUse) : 0,
          customer: selectedCustomer,
          isOffline: true,
          splitPayments: payments,
        });

        // Reset state
        resetCheckoutState();
        setIsReceiptOpen(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to save offline sale';
        toast.error(message);
      } finally {
        setProcessingPayment(false);
      }
      return;
    }

    // online flow
    try {
      const res = await fetchAPI('/pos/sync', {
        method: 'POST',
        body: JSON.stringify(salePayload),
      });

      if (res.success) {
        toast.success('Sale synced successfully & General Ledger journaled! 🧾');

        // Save transaction details for receipt modal
        setLastTransaction({
          receiptNo: `REC-${Date.now().toString().slice(-6)}`,
          date: new Date(createdAt).toLocaleString(),
          items: [...cart],
          subtotal: calculateSubtotal(),
          catalogDiscount: calculateCatalogDiscount(),
          discount: calculateDiscountValue(),
          couponDiscount: calculateCouponDiscount(),
          couponCode: couponApplied?.code || null,
          shippingFee: calculateShippingFee(),
          deliveryZone: deliveryZone || null,
          tax: calculateTax(),
          grandTotal: calculateGrandTotal(),
          paymentMethod: splitPayment ? 'SPLIT' : paymentMethod,
          amountTendered: splitPayment
            ? Number(splitPayments.cash || 0)
            : (amountTendered === '' ? remainingAmount : Number(amountTendered)),
          changeDue: splitPayment
            ? 0
            : (paymentMethod === 'cash' && amountTendered !== '' ? Number(amountTendered) - remainingAmount : 0),
          walletDeduction: useWalletBalance && walletAmountToUse !== '' ? Number(walletAmountToUse) : 0,
          customer: selectedCustomer,
          splitPayments: payments,
        });

        // Reset state
        resetCheckoutState();
        setIsReceiptOpen(true); // Open receipt modal

        // Reload shift stats
        const activeRes = await fetchAPI('/pos/shift/active');
        if (activeRes.success) setActiveShift(activeRes.data);
      }
    } catch (err: unknown) {
      // If network failure, offer to queue offline
      console.error('Online checkout failed:', err);
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('fetch')) {
        // Network connection error - queue it
        const queuedSale = {
          ...salePayload,
          _metadata: {
            customerName: selectedCustomer?.name || 'Walk-in Customer',
            grandTotal: calculateGrandTotal(),
            itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
          }
        };
        setOfflineQueue((prev) => [...prev, queuedSale]);
        toast.success('Network issue detected: Sale queued for synchronization!');

        setLastTransaction({
          receiptNo: `OFF-${offlineSaleId.slice(-6).toUpperCase()}`,
          date: new Date(createdAt).toLocaleString(),
          items: [...cart],
          subtotal: calculateSubtotal(),
          catalogDiscount: calculateCatalogDiscount(),
          discount: calculateDiscountValue(),
          couponDiscount: calculateCouponDiscount(),
          couponCode: couponApplied?.code || null,
          shippingFee: calculateShippingFee(),
          deliveryZone: deliveryZone || null,
          tax: calculateTax(),
          grandTotal: calculateGrandTotal(),
          paymentMethod: splitPayment ? 'SPLIT' : paymentMethod,
          amountTendered: splitPayment
            ? Number(splitPayments.cash || 0)
            : (amountTendered === '' ? remainingAmount : Number(amountTendered)),
          changeDue: splitPayment
            ? 0
            : (paymentMethod === 'cash' && amountTendered !== '' ? Number(amountTendered) - remainingAmount : 0),
          walletDeduction: useWalletBalance && walletAmountToUse !== '' ? Number(walletAmountToUse) : 0,
          customer: selectedCustomer,
          isOffline: true,
          splitPayments: payments,
        });
        resetCheckoutState();
        setIsReceiptOpen(true);
      } else {
        toast.error(err?.message || 'Failed to sync POS transaction');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const resetCheckoutState = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    setAmountTendered('');
    setDiscount(0);
    setCouponApplied(null);
    setCouponCode('');
    setDeliveryZone('');
    setShippingAddress('');
    setUseWalletBalance(false);
    setWalletAmountToUse('');
    setWalletBalance(0);
    setOutstandingBalance(0);
    setSelectedCustomer(null);
    setSplitPayment(false);
    setSplitPayments({
      cash: '',
      card: '',
      mobile: '',
      on_account: '',
    });
  };

  const filteredProducts = products;

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
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col xl:flex-row gap-6 xl:items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4 min-w-0">
          <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
            <Coins className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-lg">Active Terminal Shift</h3>
              {isOnline ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-1" />
                  Cloud Online
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/20 text-amber-450 border border-amber-500/30 rounded-full text-[9px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse mr-1" />
                  Offline Mode
                </span>
              )}
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[9px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse mr-1" />
                Scanner Live
              </span>
              {offlineQueue.length > 0 && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[9px] font-black uppercase tracking-wider">
                  {offlineQueue.length} Queued
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium min-w-0 truncate">
              Terminal: <span className="font-bold text-white">{activeShift.register?.name}</span> | Cashier ID:{' '}
              <span className="font-bold text-white">{activeShift.userId?.substring(0, 8)}...</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 min-w-0">
          <div className="flex flex-wrap gap-4 md:gap-6 w-full md:w-auto">
            <div className="text-center md:text-left min-w-[140px]">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drawer Base</p>
              <p className="font-black text-sm">${Number(activeShift.openingBalance).toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center md:text-left min-w-[140px]">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash Sales</p>
              <p className="font-black text-sm text-emerald-400">+${Number(activeShift.cashSales).toFixed(2)}</p>
            </div>
            {Number(activeShift.cashIn || 0) > 0 && (
              <>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash In</p>
                  <p className="font-black text-sm text-emerald-400">+${Number(activeShift.cashIn).toFixed(2)}</p>
                </div>
              </>
            )}
            {Number(activeShift.cashOut || 0) > 0 && (
              <>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash Out</p>
                  <p className="font-black text-sm text-red-400">-${Number(activeShift.cashOut).toFixed(2)}</p>
                </div>
              </>
            )}
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center md:text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expected Balance</p>
              <p className="font-black text-sm text-brand-400">${Number(activeShift.expectedClosingBalance).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
            {isOnline && offlineQueue.length > 0 && (
              <button
                onClick={() => syncOfflineQueue()}
                disabled={isSyncing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSyncing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Sync Queue
              </button>
            )}

            <button
              onClick={() => {
                setDrawerTxType('CASH_IN');
                setDrawerAmount('');
                setDrawerReason('');
                setIsDrawerOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-750 transition-all"
            >
              Cash In/Out
            </button>

            <button
              onClick={() => {
                setReturnOrderId('');
                setReturnOrder(null);
                setReturnQuantities({});
                setIsReturnOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-750 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Return/Exchange
            </button>

            <button
              onClick={() => setIsCloseShiftOpen(true)}
              className="px-4 py-2.5 bg-red-650 hover:bg-red-750 text-white text-xs font-black rounded-xl shadow-lg transition-all"
            >
              Audit & Close Till
            </button>
          </div>
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
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-brand-600 dark:text-brand-400 font-black">
                        ${item.price.toFixed(2)} each
                      </span>

                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                        Tax: ${(() => {
                          const rawTax = item.product.taxRate;
                          const itemTaxRate = rawTax !== undefined && rawTax !== null && !isNaN(Number(rawTax)) ? Number(rawTax) : taxRate;
                          const discAmt = Number(item.product.discountAmount || 0);
                          const discType = item.product.discountType || 'fixed';
                          const unitPrice = discType === 'percentage' ? item.price * (1 - discAmt / 100) : item.price - discAmt;
                          const itemSubtotal = Math.max(0, unitPrice) * item.quantity;
                          const itemTax = (itemSubtotal * itemTaxRate) / 100;
                          return itemTax.toFixed(2);
                        })()}
                      </span>

                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
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
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setDiscountType(e.target.value)}
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
              {(calculateCatalogDiscount() + calculateDiscountValue() + calculateCouponDiscount()) > 0 && (
                <div className="flex justify-between text-xs text-emerald-500 font-bold">
                  <span>Discount</span>
                  <span>-${(calculateCatalogDiscount() + calculateDiscountValue() + calculateCouponDiscount()).toFixed(2)}</span>
                </div>
              )}
              {calculateCouponDiscount() > 0 && (
                <div className="flex justify-between text-xs text-emerald-500 font-bold">
                  <span>Promo Coupon Discount</span>
                  <span>-${calculateCouponDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{taxName} ({taxRate}%)</span>
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
              id="pos-product-search"
              autoFocus
              type="text"
              placeholder="Quick search products by name, code, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
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
                {categories.map((c) => (
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
                {brands.map((b) => (
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
              <div className="flex flex-col h-full justify-between gap-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-2">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-500 hover:shadow-lg rounded-xl text-left transition-all gap-1.5 group"
                    >
                      <div className="w-full aspect-square rounded-lg bg-slate-50 dark:bg-slate-955 overflow-hidden border border-slate-100/60 dark:border-slate-850 flex items-center justify-center relative">
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
                {productPagination.totalPages > 1 && (
                  <div className="mt-auto py-2 border-t border-slate-100 dark:border-slate-800 flex justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                    <Pagination
                      currentPage={productPagination.page}
                      totalPages={productPagination.totalPages}
                      onPageChange={handleProductPageChange}
                      loading={loadingProducts}
                    />
                  </div>
                )}
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
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
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

              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Method selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Payment Method
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-black uppercase tracking-wider text-slate-500">
                      <input
                        type="checkbox"
                        checked={splitPayment}
                        onChange={(e) => {
                          setSplitPayment(e.target.checked);
                          setSplitPayments({
                            cash: '',
                            card: '',
                            mobile: '',
                            on_account: '',
                          });
                        }}
                        className="rounded border-slate-350 text-brand-600 focus:ring-brand-500 h-3 w-3"
                      />
                      Split Payment
                    </label>
                  </div>

                  {!splitPayment ? (
                    <div className="grid grid-cols-5 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'cash'
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                          : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-650'
                          }`}
                      >
                        <Banknote className="w-3.5 h-3.5" /> Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'card'
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                          : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-650'
                          }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mobile')}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'mobile'
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                          : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-650'
                          }`}
                      >
                        <QrCode className="w-3.5 h-3.5" /> Mobile
                      </button>
                      <button
                        type="button"
                        disabled={!selectedCustomer}
                        onClick={() => setPaymentMethod('on_account')}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'on_account'
                          ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md'
                          : 'border-slate-200 dark:border-slate-850 hover:border-slate-400 text-slate-650'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <Coins className="w-3.5 h-3.5" /> Account
                      </button>
                      <button
                        type="button"
                        disabled={!selectedCustomer}
                        onClick={() => {
                          setPaymentMethod('wallet');
                          setWalletBalance(0);
                          setWalletAmountToUse('');
                          if (selectedCustomer) {
                            fetchAPI(`/finance/wallet/${selectedCustomer.id}`)
                              .then((res) => {
                                if (res.success && res.data) {
                                  const bal = Number(res.data.balance || 0);
                                  setWalletBalance(bal);
                                  setWalletAmountToUse(Math.min(bal, calculateGrandTotal()));
                                }
                              })
                              .catch(() => setWalletBalance(0));
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border gap-1 transition-all font-bold text-[10px] ${paymentMethod === 'wallet'
                          ? 'bg-violet-600 border-violet-600 text-white shadow-md'
                          : 'border-slate-200 dark:border-slate-850 hover:border-violet-400 text-slate-650'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <Wallet className="w-3.5 h-3.5" /> Wallet
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                          <Banknote className="w-3.5 h-3.5 text-slate-400" /> Cash ($)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={splitPayments.cash}
                          onChange={(e) =>
                            setSplitPayments((prev) => ({
                              ...prev,
                              cash: e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                          className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Card ($)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={splitPayments.card}
                          onChange={(e) =>
                            setSplitPayments((prev) => ({
                              ...prev,
                              card: e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                          className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                          <QrCode className="w-3.5 h-3.5 text-slate-400" /> Mobile ($)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={splitPayments.mobile}
                          onChange={(e) =>
                            setSplitPayments((prev) => ({
                              ...prev,
                              mobile: e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                          className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-slate-650 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-slate-400" /> Account ($)
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          disabled={!selectedCustomer}
                          value={splitPayments.on_account}
                          onChange={(e) =>
                            setSplitPayments((prev) => ({
                              ...prev,
                              on_account: e.target.value === '' ? '' : Number(e.target.value),
                            }))
                          }
                          className="w-24 text-right px-2.5 py-1 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] font-black">
                        <span className="text-slate-400">Total Applied:</span>
                        <span
                          className={
                            Math.abs(getSplitPaymentsSum() - getRemainingPayableAmount()) < 0.01
                              ? 'text-emerald-500'
                              : 'text-red-500'
                          }
                        >
                          ${getSplitPaymentsSum().toFixed(2)} / ${getRemainingPayableAmount().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Credit Profile */}
                {selectedCustomer && (
                  <div className="space-y-2 p-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-850">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-350">Customer Profile</span>
                      {selectedCustomer.creditHold && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-650 text-[9px] font-black rounded-full uppercase tracking-wider">
                          Credit Hold
                        </span>
                      )}
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px]">
                      <p className="text-slate-400 font-bold uppercase tracking-wider">Credit Limit / Debt</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">
                        ${Number(selectedCustomer.creditLimit || 0).toFixed(2)} / ${outstandingBalance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Wallet Payment Input — shown only when WALLET method is selected */}
                {paymentMethod === 'wallet' && selectedCustomer && (
                  <div className="space-y-2 p-3 bg-violet-50/60 dark:bg-violet-950/20 rounded-2xl border border-violet-200 dark:border-violet-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-violet-700 dark:text-violet-300">
                        <Wallet className="w-3.5 h-3.5" /> Wallet Balance
                      </span>
                      <span className="text-sm font-black text-violet-700 dark:text-violet-300">
                        {walletBalance === 0 ? (
                          <span className="text-slate-400 text-[10px] font-bold">Loading…</span>
                        ) : (
                          `$${walletBalance.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {walletBalance > 0 ? (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold">Apply Amount ($)</span>
                        <input
                          type="number"
                          min="0.01"
                          max={walletBalance}
                          value={walletAmountToUse}
                          onChange={(e) =>
                            setWalletAmountToUse(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className="w-28 text-right px-2 py-1 border border-violet-300 dark:border-violet-700 bg-white dark:bg-slate-900 rounded-lg outline-none font-bold text-xs focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                    ) : (
                      walletBalance === 0 && (
                        <p className="text-[10px] text-slate-400 font-bold text-center py-1">No wallet balance available for this customer.</p>
                      )
                    )}
                  </div>
                )}

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

                  {paymentMethod === 'cash' && (
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
                    {Number(activeShift.cashIn || 0) > 0 && (
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Cash In (Adjustments)</span>
                        <span className="font-bold text-emerald-500">
                          +${Number(activeShift.cashIn).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {Number(activeShift.cashOut || 0) > 0 && (
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Cash Out (Adjustments)</span>
                        <span className="font-bold text-red-500">
                          -${Number(activeShift.cashOut).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span>Expected Drawer Cash</span>
                      <span className="text-brand-500 font-black">
                        ${activeShift.expectedClosingBalance}
                      </span>
                    </div>

                    {/* Non-Cash Aggregates */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Non-Cash Sales (Info Only)</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Card Sales</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ${Number(activeShift.cardSales || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Mobile Sales</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          ${Number(activeShift.mobileSales || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Actual Audited Cash Count
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDenoCalc(!showDenoCalc)}
                        className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${showDenoCalc
                          ? 'bg-red-500/10 border-red-500/30 text-red-650'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                      >
                        {showDenoCalc ? 'Close Calculator' : 'Use Calculator'}
                      </button>
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={closingBalance}
                      readOnly={showDenoCalc}
                      onChange={(e) =>
                        setClosingBalance(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      placeholder="0.00"
                      className={`w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-extrabold text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-colors ${showDenoCalc ? 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-850 cursor-not-allowed opacity-90' : 'bg-white dark:bg-slate-900'
                        }`}
                    />
                  </div>

                  {showDenoCalc && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-4 overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          Denomination Counter
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDenoCounts({
                              '100': 0,
                              '50': 0,
                              '20': 0,
                              '10': 0,
                              '5': 0,
                              '1': 0,
                              '0.25': 0,
                              '0.10': 0,
                              '0.05': 0,
                              '0.01': 0,
                            });
                          }}
                          className="text-[9px] font-bold text-slate-450 hover:text-red-500 uppercase tracking-widest transition-colors"
                        >
                          Clear All
                        </button>
                      </div>

                      {/* Bills Section */}
                      <div className="space-y-2">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/40 dark:border-slate-800/40 pb-1">
                          Bills (Notes)
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {DENOMINATIONS.filter((d) => d.type === 'bill').map((d) => (
                            <div key={d.value} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-350 min-w-[32px]">{d.label}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-semibold">×</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={denoCounts[String(d.value)] || 0}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value));
                                    setDenoCounts((prev) => ({
                                      ...prev,
                                      [String(d.value)]: val,
                                    }));
                                  }}
                                  className="w-12 px-1.5 py-1 text-center text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Coins Section */}
                      <div className="space-y-2">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/40 dark:border-slate-800/40 pb-1">
                          Coins
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {DENOMINATIONS.filter((d) => d.type === 'coin').map((d) => (
                            <div key={d.value} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-350 min-w-[32px]">{d.label}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-semibold">×</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={denoCounts[String(d.value)] || 0}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value));
                                    setDenoCounts((prev) => ({
                                      ...prev,
                                      [String(d.value)]: val,
                                    }));
                                  }}
                                  className="w-12 px-1.5 py-1 text-center text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg outline-none focus:ring-1 focus:ring-red-500 text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {closingBalance !== '' && (
                    <div className="flex justify-between items-center text-xs p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                      <span className="font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1.5">
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

      {/* 5. POS RETAIL RETURN & EXCHANGE MODAL */}
      <AnimatePresence>
        {isReturnOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-brand-500" />
                    Process POS Return & Exchange
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">Issue customer store credit or perform straight exchanges at the counter</p>
                </div>
                <button
                  onClick={() => setIsReturnOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Search Order Section */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Order ID or Invoice Code..."
                      value={returnOrderId}
                      onChange={(e) => setReturnOrderId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 transition-all font-bold text-sm shadow-sm"
                    />
                  </div>
                  <button
                    onClick={handleSearchReturnOrder}
                    disabled={searchingOrder}
                    className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-sm rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {searchingOrder ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Search Order'
                    )}
                  </button>
                </div>

                {returnOrder ? (
                  <div className="space-y-6">
                    {/* Order summary info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Customer Reference</p>
                        <p className="text-sm font-black text-slate-850 dark:text-white">{returnOrder.customerName || returnOrder.user?.username || 'Guest Customer'}</p>
                        <p className="text-xs text-slate-400 font-medium">{returnOrder.customerPhone || 'No phone set'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Order Value & Date</p>
                        <p className="text-sm font-black text-brand-500">${Number(returnOrder.totalAmount).toFixed(2)}</p>
                        <p className="text-xs text-slate-400 font-medium">{new Date(returnOrder.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Order items lists */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Order Items (Select return quantities)</h4>
                      <div className="space-y-2">
                        {returnOrder.items.map((item) => {
                          let alreadyReturned = 0;
                          if (returnOrder.returns) {
                            for (const ret of returnOrder.returns) {
                              if (ret.status !== 'rejected') {
                                for (const retItem of ret.items) {
                                  if (
                                    retItem.productId === item.productId &&
                                    (retItem.variantId === item.variantId || (!retItem.variantId && !item.variantId))
                                  ) {
                                    alreadyReturned += Number(retItem.quantity);
                                  }
                                }
                              }
                            }
                          }
                          const maxQty = Math.max(0, item.quantity - alreadyReturned);
                          const currentQty = returnQuantities[item.id] || 0;
                          return (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850 hover:border-slate-200 dark:hover:border-slate-800 transition-all shadow-sm">
                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{item.product?.name || 'Product'}</p>
                                {item.variant && (
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                    Variant: {Object.entries(item.variant.combination).map(([k, v]) => `${k}:${v}`).join(', ')}
                                  </p>
                                )}
                                <p className="text-xs text-brand-500 font-bold mt-1">${Number(item.unitPrice).toFixed(2)} each</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReturnQuantities({
                                      ...returnQuantities,
                                      [item.id]: Math.max(0, currentQty - 1),
                                    });
                                  }}
                                  className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm font-black text-slate-900 dark:text-white w-6 text-center">
                                  {currentQty} / {maxQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReturnQuantities({
                                      ...returnQuantities,
                                      [item.id]: Math.min(maxQty, currentQty + 1),
                                    });
                                  }}
                                  className="p-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Return details inputs */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Return Reason Remarks</label>
                      <input
                        type="text"
                        placeholder="Why is the customer returning these items?"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-950 rounded-2xl outline-none text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 transition-all font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <History className="w-12 h-12 mb-3 text-slate-350 dark:text-slate-750" />
                    <p className="text-xs font-bold uppercase tracking-wider">No order selected</p>
                    <p className="text-xs text-slate-400 mt-1">Search for an order above using ID or receipt invoice reference.</p>
                  </div>
                )}
              </div>

              {returnOrder && (
                <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-slate-400">
                      Refund Total:{' '}
                      <span className="text-brand-500 font-black text-sm">
                        $
                        {Object.entries(returnQuantities)
                          .reduce((total, [itemId, qty]) => {
                            const orderItem = returnOrder.items.find((item) => item.id === itemId);
                            // Fix: subtract discountAmount to match backend calculation
                            const netUnit = orderItem
                              ? Number(orderItem.unitPrice) - Number(orderItem.discountAmount || 0)
                              : 0;
                            return total + netUnit * qty;
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </span>
                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-[11px] text-slate-600 dark:text-slate-300 space-y-2">
                      <p className="font-semibold text-slate-900 dark:text-white">Return action guidance</p>
                      <p>Straight Return & Refund: complete a normal return and issue the refund for the returned items.</p>
                      <p>Process Return & Start Exchange: process the return, then ring up replacement items as a new sale. For walk-in customers without an account, refund via CASH or CARD.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={submittingReturn}
                      onClick={() => handleSubmitPOSReturn(false)}
                      className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-2xl transition-all shadow-md disabled:opacity-50"
                    >
                      Straight Return & Refund
                    </button>
                    <button
                      type="button"
                      disabled={submittingReturn}
                      onClick={() => handleSubmitPOSReturn(true)}
                      className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-black text-xs rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                    >
                      Process Return & Start Exchange
                    </button>
                  </div>
                </div>
              )}
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
                    {lastTransaction.items.map((item: TransactionItem, idx: number) => (
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
                    {(lastTransaction.catalogDiscount + lastTransaction.discount + lastTransaction.couponDiscount) > 0 && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>Discount</span>
                        <span>-${(lastTransaction.catalogDiscount + lastTransaction.discount + lastTransaction.couponDiscount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{taxName} ({taxRate}%)</span>
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
                    {lastTransaction.walletDeduction > 0 && (
                      <div className="flex justify-between text-emerald-500 font-bold">
                        <span>Store Credit / Wallet</span>
                        <span>-${lastTransaction.walletDeduction.toFixed(2)}</span>
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
                    {lastTransaction.splitPayments && lastTransaction.splitPayments.length > 0 ? (
                      <div className="pl-2 space-y-0.5 border-l border-slate-150 dark:border-slate-800">
                        {lastTransaction.splitPayments.map((p: { method: string; amount: number }, idx: number) => (
                          <div key={idx} className="flex justify-between text-[8px]">
                            <span>- {p.method}</span>
                            <span>${Number(p.amount).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span>Amount Collected</span>
                        <span>${lastTransaction.amountTendered.toFixed(2)}</span>
                      </div>
                    )}
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

      {/* 7. CASH DRAWER MODAL */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Cash Drawer Adjustment</h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleDrawerTxSubmit}>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Transaction Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDrawerTxType('CASH_IN')}
                        className={`py-3 rounded-2xl border text-center font-bold text-sm transition-all ${drawerTxType === 'CASH_IN'
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/10'
                          : 'border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-400'
                          }`}
                      >
                        Cash In (Add float)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDrawerTxType('CASH_OUT')}
                        className={`py-3 rounded-2xl border text-center font-bold text-sm transition-all ${drawerTxType === 'CASH_OUT'
                          ? 'bg-red-650 border-red-650 text-white shadow-lg shadow-red-650/10'
                          : 'border-slate-250 dark:border-slate-800 text-slate-650 dark:text-slate-400'
                          }`}
                      >
                        Cash Out (Withdrawal)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Amount ($)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450" />
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={drawerAmount}
                        onChange={(e) =>
                          setDrawerAmount(e.target.value === '' ? '' : Number(e.target.value))
                        }
                        placeholder="0.00"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-lg outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Reason / Description
                    </label>
                    <textarea
                      required
                      placeholder="Specify transaction reason (e.g. daily float top-up, supplier payout...)"
                      value={drawerReason}
                      onChange={(e) => setDrawerReason(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none text-xs text-slate-900 dark:text-white h-20 resize-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDrawerTx}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-black rounded-xl shadow-lg flex items-center gap-2"
                  >
                    {submittingDrawerTx ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Coins className="w-4 h-4" />
                    )}
                    Submit Transaction
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
