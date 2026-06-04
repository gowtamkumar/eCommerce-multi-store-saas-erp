'use client';

import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchAPI } from '@/services/api';
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
  TransactionHistory
} from '../type';
import {
  calculateCatalogDiscount,
  calculateCouponDiscount,
  calculateDiscountValue,
  calculateShippingFee,
  calculateSubtotal,
  calculateTax,
  generateUUID,
  playBeepSound
} from '../utils/posHelpers';

export function usePosDashboard() {
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

  // Helper equations
  const subtotal = calculateSubtotal(cart);
  const catalogDiscount = calculateCatalogDiscount(cart);
  const discountValue = calculateDiscountValue(subtotal, catalogDiscount, discount, discountType);
  const couponDiscount = calculateCouponDiscount(couponApplied);
  const shippingFee = calculateShippingFee(deliveryZone);
  const tax = calculateTax(cart, subtotal, catalogDiscount, discountValue, couponDiscount, taxRate);
  
  const taxableAmount = Math.max(0, subtotal - catalogDiscount - discountValue - couponDiscount);
  const grandTotal = taxableAmount + tax + shippingFee;

  const getRemainingPayableAmount = useCallback(() => {
    const walletDeduction = useWalletBalance && walletAmountToUse !== '' ? Number(walletAmountToUse) : 0;
    return Math.max(0, grandTotal - walletDeduction);
  }, [useWalletBalance, walletAmountToUse, grandTotal]);

  const getSplitPaymentsSum = useCallback(() => {
    return (
      Number(splitPayments.cash || 0) +
      Number(splitPayments.card || 0) +
      Number(splitPayments.mobile || 0) +
      (selectedCustomer ? Number(splitPayments.on_account || 0) : 0)
    );
  }, [splitPayments, selectedCustomer]);

  const changeDue = amountTendered !== '' ? Number(amountTendered) - grandTotal : 0;

  const fetchTaxRules = useCallback(async () => {
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
  }, []);

  const checkActiveShift = useCallback(async () => {
    setLoadingShift(true);
    try {
      const res = await fetchAPI('/pos/shift/active');
      if (res.success && res.data) {
        setActiveShift(res.data);
        void fetchCategoriesAndBrands();
      }
    } catch {
      // Shift not found, load registers for opening till
      void fetchRegisters();
    } finally {
      setLoadingShift(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRegisters = useCallback(async () => {
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
  }, []);

  const fetchCategoriesAndBrands = useCallback(async () => {
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
  }, []);

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
      } final: {
        setLoadingProducts(false);
      }
    },
    [productPagination.limit]
  );

  const handleProductPageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= productPagination.totalPages) {
      void fetchProducts(newPage, debouncedSearchQuery, selectedCategoryId, selectedBrandId);
    }
  }, [productPagination.totalPages, debouncedSearchQuery, selectedCategoryId, selectedBrandId, fetchProducts]);

  useEffect(() => {
    if (activeShift) {
      void fetchProducts(1, debouncedSearchQuery, selectedCategoryId, selectedBrandId);
    }
  }, [activeShift, debouncedSearchQuery, selectedCategoryId, selectedBrandId, fetchProducts]);

  // 1. Initial mounting checks
  useEffect(() => {
    void checkActiveShift();
    void fetchTaxRules();
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
  }, [checkActiveShift, fetchTaxRules]);

  // Persist offline queue
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_offline_queue', JSON.stringify(offlineQueue));
    }
  }, [offlineQueue]);

  // Sync offline queue helper
  const syncOfflineQueue = useCallback(async (forceQueue?: OfflineSale[]) => {
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
  }, [offlineQueue]);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0 && !isSyncing) {
      void syncOfflineQueue();
    }
  }, [isOnline, offlineQueue, isSyncing, syncOfflineQueue]);

  // POS Return & Exchange Handlers
  const handleSearchReturnOrder = useCallback(async () => {
    if (!returnOrderId.trim()) {
      toast.error('Please enter an Order ID or Invoice Code');
      return;
    }
    setSearchingOrder(true);
    setReturnOrder(null);
    setReturnQuantities({});
    try {
      const res = await fetchAPI(`/orders/${returnOrderId.trim()}`);
      if (res.success && res.data) {
        setReturnOrder(res.data);
        return;
      }
    } catch {
      // ignore & fallback
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
  }, [returnOrderId]);

  const handleSubmitPOSReturn = useCallback(async (isExchange: boolean) => {
    if (!returnOrder) return;
    const itemsToReturn = Object.entries(returnQuantities)
      .map(([itemId, qty]) => {
        const orderItem = returnOrder.items.find((item) => item.id === itemId);
        if (!orderItem) return null;
        return {
          productId: orderItem.productId,
          variantId: orderItem.variantId || undefined,
          quantity: qty,
        };
      })
      .filter((item): item is { productId: string; variantId: string | undefined; quantity: number } => item !== null && item.quantity > 0);

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
  }, [returnOrder, returnQuantities, returnReason]);

  // 2. Shift Management Actions
  const handleOpenShift = useCallback(async (e: React.FormEvent) => {
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
        void fetchCategoriesAndBrands();
      }
    } catch (error) {
      toast.error((error as { message?: string })?.message || 'Error opening till');
    } finally {
      setSubmittingShift(false);
    }
  }, [selectedRegisterId, openingBalance, fetchCategoriesAndBrands]);

  const handleCloseShift = useCallback(async (e: React.FormEvent) => {
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
        void fetchRegisters();
      }
    } catch {
      toast.error('Error closing counter till');
    } finally {
      setSubmittingShift(false);
    }
  }, [closingBalance, closingRemarks, activeShift, fetchRegisters]);

  const handleDrawerTxSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [drawerAmount, activeShift, drawerTxType, drawerReason]);

  // 3. Cart & Sales Management
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

  const addToCart = useCallback((product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProductForVariant(product);
      setSelectedVariant(product.variants[0]);
      return;
    }
    executeAddToCart(product);
  }, [executeAddToCart]);

  const updateQuantity = useCallback((index: number, delta: number) => {
    setCart((currentCart) => {
      const updatedCart = [...currentCart];
      const newQty = updatedCart[index].quantity + delta;
      if (newQty <= 0) {
        updatedCart.splice(index, 1);
      } else {
        updatedCart[index].quantity = newQty;
      }
      return updatedCart;
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((currentCart) => {
      const updatedCart = [...currentCart];
      updatedCart.splice(index, 1);
      return updatedCart;
    });
  }, []);

  const fetchCustomers = useCallback(async (q = '') => {
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
  }, []);

  useEffect(() => {
    if (activeShift) {
      void fetchCustomers();
    }
  }, [activeShift, fetchCustomers]);

  const findAndAddProductByCode = useCallback(async (query: string, rawQuery: string): Promise<boolean> => {
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
  }, [products, executeAddToCart]);

  const handleSearchKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return;

      const success = await findAndAddProductByCode(query, searchQuery);
      if (success) {
        setSearchQuery('');
      }
      e.preventDefault();
    }
  }, [searchQuery, findAndAddProductByCode]);

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
          void findAndAddProductByCode(query, rawQuery);
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

  // Fetch outstanding AR balance whenever customer changes
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

  // Dynamically calculate closingBalance when denomination counts change
  useEffect(() => {
    if (showDenoCalc) {
      const total = Object.entries(denoCounts).reduce((acc, [valueStr, count]) => {
        const val = parseFloat(valueStr);
        return acc + val * count;
      }, 0);
      setClosingBalance(Number(total.toFixed(2)));
    }
  }, [denoCounts, showDenoCalc]);

  // Premium Coupon Handlers
  const handleApplyCoupon = useCallback(async () => {
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
          orderTotal: subtotal
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
  }, [couponCode, subtotal]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponApplied(null);
    setCouponCode('');
    toast.success('Coupon removed');
  }, []);

  const resetCheckoutState = useCallback(() => {
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
  }, []);

  // 4. Sales Sync Processing
  const handleConfirmCheckout = useCallback(async () => {
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

    const isWalletPayment = !splitPayment && paymentMethod === 'wallet';
    const resolvedUseWallet = isWalletPayment ? true : useWalletBalance;
    const resolvedWalletAmount = isWalletPayment
      ? (walletAmountToUse !== '' ? Number(walletAmountToUse) : undefined)
      : (useWalletBalance && walletAmountToUse !== '' ? Number(walletAmountToUse) : undefined);

    const salePayload = {
      shiftId: activeShift?.id || '',
      items: itemsPayload,
      paymentMethod: splitPayment ? 'cash' : paymentMethod,
      paymentAmount: grandTotal,
      customerId: selectedCustomer?.id || undefined,
      appliedCoupon: couponApplied?.code || undefined,
      couponDiscountAmount: couponDiscount + discountValue,
      deliveryZone: deliveryZone || undefined,
      shippingFee: shippingFee,
      shippingAddress: shippingAddress || undefined,
      useWalletBalance: resolvedUseWallet || undefined,
      walletAmountToUse: resolvedWalletAmount,
      offlineSaleId,
      createdAt,
      payments,
    };

    setProcessingPayment(true);

    if (!isOnline) {
      try {
        const queuedSale = {
          ...salePayload,
          _metadata: {
            customerName: selectedCustomer?.name || 'Walk-in Customer',
            grandTotal: grandTotal,
            itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
          }
        };
        setOfflineQueue((prev) => [...prev, queuedSale]);
        toast.success('Offline mode: Sale queued for synchronization!');

        setLastTransaction({
          receiptNo: `OFF-${offlineSaleId.slice(-6).toUpperCase()}`,
          date: new Date(createdAt).toLocaleString(),
          items: [...cart],
          subtotal: subtotal,
          catalogDiscount: catalogDiscount,
          discount: discountValue,
          couponDiscount: couponDiscount,
          couponCode: couponApplied?.code || null,
          shippingFee: shippingFee,
          deliveryZone: deliveryZone || null,
          tax: tax,
          grandTotal: grandTotal,
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to save offline sale';
        toast.error(message);
      } finally {
        setProcessingPayment(false);
      }
      return;
    }

    try {
      const res = await fetchAPI('/pos/sync', {
        method: 'POST',
        body: JSON.stringify(salePayload),
      });

      if (res.success) {
        toast.success('Sale synced successfully & General Ledger journaled! 🧾');

        setLastTransaction({
          receiptNo: res.data?.orderId
            ? `#${res.data.orderId.slice(-8).toUpperCase()}`
            : `REC-${Date.now().toString().slice(-6)}`,
          date: new Date(createdAt).toLocaleString(),
          items: [...cart],
          subtotal: subtotal,
          catalogDiscount: catalogDiscount,
          discount: discountValue,
          couponDiscount: couponDiscount,
          couponCode: couponApplied?.code || null,
          shippingFee: shippingFee,
          deliveryZone: deliveryZone || null,
          tax: tax,
          grandTotal: grandTotal,
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

        resetCheckoutState();
        setIsReceiptOpen(true);

        const activeRes = await fetchAPI('/pos/shift/active');
        if (activeRes.success) setActiveShift(activeRes.data);
      }
    } catch (err: unknown) {
      console.error('Online checkout failed:', err);
      const errorMessage = err instanceof Error ? err.message : '';
      if (errorMessage.includes('fetch')) {
        const queuedSale = {
          ...salePayload,
          _metadata: {
            customerName: selectedCustomer?.name || 'Walk-in Customer',
            grandTotal: grandTotal,
            itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
          }
        };
        setOfflineQueue((prev) => [...prev, queuedSale]);
        toast.success('Network issue detected: Sale queued for synchronization!');

        setLastTransaction({
          receiptNo: `OFF-${offlineSaleId.slice(-6).toUpperCase()}`,
          date: new Date(createdAt).toLocaleString(),
          items: [...cart],
          subtotal: subtotal,
          catalogDiscount: catalogDiscount,
          discount: discountValue,
          couponDiscount: couponDiscount,
          couponCode: couponApplied?.code || null,
          shippingFee: shippingFee,
          deliveryZone: deliveryZone || null,
          tax: tax,
          grandTotal: grandTotal,
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
        toast.error(errorMessage || 'Failed to sync POS transaction');
      }
    } finally {
      setProcessingPayment(false);
    }
  }, [
    grandTotal,
    splitPayment,
    getSplitPaymentsSum,
    selectedCustomer,
    splitPayments,
    paymentMethod,
    amountTendered,
    cart,
    useWalletBalance,
    walletAmountToUse,
    activeShift,
    couponApplied,
    couponDiscount,
    discountValue,
    deliveryZone,
    shippingFee,
    shippingAddress,
    isOnline,
    subtotal,
    catalogDiscount,
    tax,
    getRemainingPayableAmount,
    resetCheckoutState
  ]);

  const handleWalletSelect = useCallback((cust: Customer) => {
    setPaymentMethod('wallet');
    setWalletBalance(0);
    setWalletAmountToUse('');
    fetchAPI(`/finance/wallet/${cust.id}`)
      .then((res) => {
        if (res.success && res.data) {
          const bal = Number(res.data.balance || 0);
          setWalletBalance(bal);
          setWalletAmountToUse(Math.min(bal, grandTotal));
        }
      })
      .catch(() => setWalletBalance(0));
  }, [grandTotal]);

  return {
    // Session / Shift
    loadingShift,
    activeShift,
    registers,
    selectedRegisterId,
    setSelectedRegisterId,
    openingBalance,
    setOpeningBalance,
    submittingShift,
    handleOpenShift,
    handleCloseShift,

    // Billing & Catalog
    products,
    searchQuery,
    setSearchQuery,
    categories,
    brands,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedBrandId,
    setSelectedBrandId,
    cart,
    addToCart,
    executeAddToCart,
    updateQuantity,
    removeFromCart,

    // Pagination
    loadingProducts,
    productPagination,
    handleProductPageChange,
    debouncedSearchQuery,
    selectedProductForVariant,
    setSelectedProductForVariant,
    selectedVariant,
    setSelectedVariant,

    // Checkout
    isCheckoutOpen,
    setIsCheckoutOpen,
    paymentMethod,
    setPaymentMethod,
    amountTendered,
    setAmountTendered,
    processingPayment,
    handleConfirmCheckout,

    // Offline Sync
    isOnline,
    offlineQueue,
    isSyncing,
    syncOfflineQueue,

    // Split Payment
    splitPayment,
    setSplitPayment,
    splitPayments,
    setSplitPayments,
    getSplitPaymentsSum,
    getRemainingPayableAmount,

    // Drawer Adjustments
    isDrawerOpen,
    setIsDrawerOpen,
    drawerTxType,
    setDrawerTxType,
    drawerAmount,
    setDrawerAmount,
    drawerReason,
    setDrawerReason,
    submittingDrawerTx,
    handleDrawerTxSubmit,

    // Advanced features
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    customers,
    customerSearchQuery,
    setCustomerSearchQuery,
    selectedCustomer,
    setSelectedCustomer,
    showCustomerDropdown,
    setShowCustomerDropdown,
    loadingCustomers,
    fetchCustomers,
    isReceiptOpen,
    setIsReceiptOpen,
    lastTransaction,

    // Coupons
    couponCode,
    setCouponCode,
    couponApplied,
    handleApplyCoupon,
    handleRemoveCoupon,
    validatingCoupon,

    // Delivery
    deliveryZone,
    setDeliveryZone,
    shippingAddress,
    setShippingAddress,

    // Tax
    taxRate,
    taxName,

    // Wallet
    walletBalance,
    outstandingBalance,
    useWalletBalance,
    setUseWalletBalance,
    walletAmountToUse,
    setWalletAmountToUse,
    handleWalletSelect,

    // Close Shift Modal States
    isCloseShiftOpen,
    setIsCloseShiftOpen,
    closingBalance,
    setClosingBalance,
    closingRemarks,
    setClosingRemarks,
    showDenoCalc,
    setShowDenoCalc,
    denoCounts,
    setDenoCounts,

    // Return Order States
    isReturnOpen,
    setIsReturnOpen,
    returnOrderId,
    setReturnOrderId,
    searchingOrder,
    returnOrder,
    returnQuantities,
    setReturnQuantities,
    returnReason,
    setReturnReason,
    submittingReturn,
    handleSearchReturnOrder,
    handleSubmitPOSReturn,

    // Calculated values
    subtotal,
    catalogDiscount,
    discountValue,
    couponDiscount,
    shippingFee,
    tax,
    taxableAmount,
    grandTotal,
    changeDue,
  };
}
