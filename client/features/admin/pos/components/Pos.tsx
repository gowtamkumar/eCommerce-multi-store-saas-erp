'use client';

import { ChangeEvent, useState } from 'react';
import Pagination from '@/components/shared/Pagination';
import { fetchAPI } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import {
  Banknote,
  ChevronDown,
  Coins,
  LayoutGrid,
  Loader2,
  Minus,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  User,
  X,
  Sparkles
} from 'lucide-react';
import { useSettings } from '@/hooks/SettingsContext';
import { usePosDashboard } from '../hooks/usePosDashboard';

// Subcomponents
import OpenTillScreen from './OpenTillScreen';
import DrawerTxModal from './DrawerTxModal';
import CloseShiftModal from './CloseShiftModal';
import VariantSelectorModal from './VariantSelectorModal';
import ReceiptModal from './ReceiptModal';
import ReturnModal from './ReturnModal';
import CheckoutModal from './CheckoutModal';
import PosAiAssistModal from './PosAiAssistModal';

export default function Pos() {
  const {
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
  } = usePosDashboard();

  const { selectedCurrency } = useSettings();
  const currencySymbol = selectedCurrency?.symbol || '$';

  const [isAiAssistOpen, setIsAiAssistOpen] = useState(false);

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
      <OpenTillScreen
        registers={registers}
        selectedRegisterId={selectedRegisterId}
        setSelectedRegisterId={setSelectedRegisterId}
        openingBalance={openingBalance}
        setOpeningBalance={setOpeningBalance}
        submittingShift={submittingShift}
        handleOpenShift={handleOpenShift}
      />
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
              <p className="font-black text-sm">{formatCurrency(activeShift.openingBalance, currencySymbol)}</p>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center md:text-left min-w-[140px]">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash Sales</p>
              <p className="font-black text-sm text-emerald-400">+{formatCurrency(activeShift.cashSales, currencySymbol)}</p>
            </div>
            {Number(activeShift.cashIn || 0) > 0 && (
              <>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash In</p>
                  <p className="font-black text-sm text-emerald-400">+{formatCurrency(activeShift.cashIn || 0, currencySymbol)}</p>
                </div>
              </>
            )}
            {Number(activeShift.cashOut || 0) > 0 && (
              <>
                <div className="w-px h-8 bg-slate-800" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cash Out</p>
                  <p className="font-black text-sm text-red-400">-{formatCurrency(activeShift.cashOut || 0, currencySymbol)}</p>
                </div>
              </>
            )}
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center md:text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expected Balance</p>
              <p className="font-black text-sm text-brand-400">{formatCurrency(activeShift.expectedClosingBalance, currencySymbol)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-auto">
            {isOnline && offlineQueue.length > 0 && (
              <button
                onClick={() => void syncOfflineQueue()}
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
                handleSubmitPOSReturn(false); // reset return variables
                setIsReturnOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl border border-slate-750 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Return/Exchange
            </button>

            <button
              onClick={() => setIsAiAssistOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-700 hover:to-violet-700 text-white text-xs font-black rounded-xl shadow-lg hover:shadow-brand-500/10 transition-all flex items-center gap-1.5 border border-brand-500/30"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI Cashier Assist
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
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-880 rounded-3xl shadow-xl flex flex-col h-[75vh]">
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
                        {formatCurrency(item.price, currencySymbol)} each
                      </span>

                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                        Tax: {(() => {
                          const rawTax = item.product.taxRate;
                          const itemTaxRate = rawTax !== undefined && rawTax !== null && !isNaN(Number(rawTax)) ? Number(rawTax) : taxRate;
                          const discAmt = Number(item.product.discountAmount || 0);
                          const discType = item.product.discountType || 'fixed';
                          const unitPrice = discType === 'percentage' ? item.price * (1 - discAmt / 100) : item.price - discAmt;
                          const itemSubtotal = Math.max(0, unitPrice) * item.quantity;
                          const itemTax = (itemSubtotal * itemTaxRate) / 100;
                          return formatCurrency(itemTax, currencySymbol);
                        })()}
                      </span>

                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded-md">
                        Subtotal: {formatCurrency(item.price * item.quantity, currencySymbol)}
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
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-xl"
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
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-955/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-black text-emerald-900 dark:text-emerald-350">{selectedCustomer.name}</p>
                      <p className="text-[9px] font-bold text-emerald-650 dark:text-emerald-500">{selectedCustomer.phone || selectedCustomer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg text-emerald-650"
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
                        void fetchCustomers(e.target.value);
                      }}
                      className="w-full pl-9 pr-4 py-2 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-2xl outline-none font-bold text-xs"
                    />
                    {customerSearchQuery && (
                      <button
                        onClick={() => {
                          setCustomerSearchQuery('');
                          void fetchCustomers('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setDiscountType(e.target.value as 'FIXED' | 'PERCENT')}
                  className="px-2 py-1.5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-white rounded-xl outline-none font-bold text-xs"
                >
                  <option value="FIXED">Flat ({currencySymbol})</option>
                  <option value="PERCENT">Percent (%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Coupon Code Promo Block */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-955/40">
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
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-955/20 dark:hover:bg-red-900/30 text-red-655 font-bold rounded-xl text-xs transition-all"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={validatingCoupon || !couponCode.trim()}
                    onClick={() => void handleApplyCoupon()}
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
                <span>-{formatCurrency(couponDiscount, currencySymbol)} off</span>
              </div>
            )}
          </div>

          {/* Cart Pricing summary footer */}
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-4 rounded-b-3xl">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formatCurrency(subtotal, currencySymbol)}
                </span>
              </div>
              {(catalogDiscount + discountValue + couponDiscount) > 0 && (
                <div className="flex justify-between text-xs text-emerald-500 font-bold">
                  <span>Discount</span>
                  <span>-{formatCurrency(catalogDiscount + discountValue + couponDiscount, currencySymbol)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-500 font-bold">
                  <span>Promo Coupon Discount</span>
                  <span>-{formatCurrency(couponDiscount, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{taxName} ({taxRate}%)</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {formatCurrency(tax, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Grand Total</span>
                <span className="text-brand-600 dark:text-brand-400 font-black">
                  {formatCurrency(grandTotal, currencySymbol)}
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
              onKeyDown={(e) => void handleProductPageChange(1)} // Search reset page to 1
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
            {products.length === 0 ? (
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
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brand-500 hover:shadow-lg rounded-xl text-left transition-all gap-1.5 group"
                    >
                      <div className="w-full aspect-square rounded-lg bg-slate-50 dark:bg-slate-900 overflow-hidden border border-slate-100/60 dark:border-slate-850 flex items-center justify-center relative">
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
                            {formatCurrency(p.price, currencySymbol)}
                          </span>
                          <span className="text-[8px] font-bold px-1 py-0.5 bg-slate-50 dark:bg-slate-850 rounded text-slate-505">
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

      {/* Modals & Subcomponents */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        amountTendered={amountTendered}
        setAmountTendered={setAmountTendered}
        processingPayment={processingPayment}
        handleConfirmCheckout={handleConfirmCheckout}
        splitPayment={splitPayment}
        setSplitPayment={setSplitPayment}
        splitPayments={splitPayments}
        setSplitPayments={setSplitPayments}
        selectedCustomer={selectedCustomer}
        walletBalance={walletBalance}
        outstandingBalance={outstandingBalance}
        useWalletBalance={useWalletBalance}
        setUseWalletBalance={setUseWalletBalance}
        walletAmountToUse={walletAmountToUse}
        setWalletAmountToUse={setWalletAmountToUse}
        handleWalletSelect={handleWalletSelect}
        deliveryZone={deliveryZone}
        setDeliveryZone={setDeliveryZone}
        shippingAddress={shippingAddress}
        setShippingAddress={setShippingAddress}
        grandTotal={grandTotal}
        changeDue={changeDue}
        getSplitPaymentsSum={getSplitPaymentsSum}
        getRemainingPayableAmount={getRemainingPayableAmount}
        taxName={taxName}
        taxRate={taxRate}
        taxableAmount={taxableAmount}
        tax={tax}
        shippingFee={shippingFee}
      />

      <CloseShiftModal
        isOpen={isCloseShiftOpen}
        onClose={() => setIsCloseShiftOpen(false)}
        activeShift={activeShift}
        closingBalance={closingBalance}
        setClosingBalance={setClosingBalance}
        closingRemarks={closingRemarks}
        setClosingRemarks={setClosingRemarks}
        showDenoCalc={showDenoCalc}
        setShowDenoCalc={setShowDenoCalc}
        denoCounts={denoCounts}
        setDenoCounts={setDenoCounts}
        submittingShift={submittingShift}
        handleCloseShift={handleCloseShift}
      />

      <DrawerTxModal
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        drawerTxType={drawerTxType}
        setDrawerTxType={setDrawerTxType}
        drawerAmount={drawerAmount}
        setDrawerAmount={setDrawerAmount}
        drawerReason={drawerReason}
        setDrawerReason={setDrawerReason}
        submittingDrawerTx={submittingDrawerTx}
        handleDrawerTxSubmit={handleDrawerTxSubmit}
      />

      <VariantSelectorModal
        selectedProductForVariant={selectedProductForVariant}
        setSelectedProductForVariant={setSelectedProductForVariant}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        executeAddToCart={executeAddToCart}
      />

      <ReturnModal
        isOpen={isReturnOpen}
        onClose={() => setIsReturnOpen(false)}
        returnOrderId={returnOrderId}
        setReturnOrderId={setReturnOrderId}
        searchingOrder={searchingOrder}
        returnOrder={returnOrder}
        returnQuantities={returnQuantities}
        setReturnQuantities={setReturnQuantities}
        returnReason={returnReason}
        setReturnReason={setReturnReason}
        submittingReturn={submittingReturn}
        handleSearchReturnOrder={handleSearchReturnOrder}
        handleSubmitPOSReturn={handleSubmitPOSReturn}
      />

      {lastTransaction && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          lastTransaction={lastTransaction}
          activeShift={activeShift}
          taxName={taxName}
          taxRate={taxRate}
        />
      )}

      <PosAiAssistModal
        isOpen={isAiAssistOpen}
        onClose={() => setIsAiAssistOpen(false)}
        cart={cart}
        activeShift={activeShift}
        selectedCustomer={selectedCustomer}
      />
    </div>
  );
}
