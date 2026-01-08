'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { fetchAPI } from '@/lib/api';
import { PaymentMethod } from '@/lib/enums/payment-method';
import { useDownloadInvoice } from '@/lib/handleDownloadInvoice';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CreditCard, Download, Loader2, ShieldCheck, Truck, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

const CheckoutModal = ({ isOpen, onClose, product }: CheckoutModalProps) => {
  const { settings, selectedCurrency, formatPrice, convertPrice } = useSettings();
  const { data: session } = useSession();
  const { downloadInvoice } = useDownloadInvoice();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sslcommerz'>('cod');
  const [lastOrder, setLastOrder] = useState<any>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const quantity = parseInt(formData.get('quantity') as string) || 1;

    const totalAmount = (+(product.price - (+product.discountAmount || 0))) * quantity;

    const orderData = {
      customerName: formData.get('name'),
      customerEmail: formData.get('email'),
      customerPhone: formData.get('phone'),
      address: formData.get('address'),
      orderNotes: formData.get('notes'),
      productId: product?._id,
      quantity: quantity,
      paymentMethod,
      totalAmount,
      unitPrice: product.price,
      discountAmount: product.discountAmount || 0,
      currency: selectedCurrency.code,
      currencyRate: selectedCurrency.rate,
    };

    try {
      // 1. Create Order
      const orderJson = await fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (!orderJson.success) {
        // Display the specific error message from the API
        toast.error(orderJson.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      if (paymentMethod === PaymentMethod.SSLCOMMERZ) {
        // 2. Initiate Payment
        const paymentJson = await fetchAPI('/payment/init', {
          method: 'POST',
          body: JSON.stringify({ orderId: orderJson.data.id }),
        });



        if (paymentJson.gatewayUrl) {
          window.location.href = paymentJson.gatewayUrl;
          return; // Stop execution, waiting for redirect
        } else {
          throw new Error('Failed to initiate payment gateway');
        }
      } else {
        // COD Success
        setLastOrder(orderJson.order);
        setStep('success');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl pointer-events-auto border border-white/20 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]">
              {step === 'form' ? (
                <>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">Secure Checkout</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <ShieldCheck className="w-3 h-3" /> Encrypted & Safe
                      </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                          <input
                            name="name"
                            required
                            type="text"
                            defaultValue={session?.user?.name || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <input
                              name="email"
                              required
                              type="email"
                              defaultValue={session?.user?.email || ''}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                              placeholder="john@example.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                            <input
                              name="phone"
                              required
                              type="tel"
                              defaultValue={session?.user?.phone || ''}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Shipping Address</label>
                          <input
                            name="address"
                            required
                            type="text"
                            defaultValue={session?.user?.address || ''}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                            placeholder="123 Main St, Apt 4B"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Quantity
                            {product?.stock > 0 && (
                              <span className="ml-2 text-xs text-slate-500">({product.stock} in stock)</span>
                            )}
                          </label>
                          <input
                            name="quantity"
                            required
                            type="number"
                            min="1"
                            max={product?.stock || 999}
                            defaultValue="1"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                            placeholder="1"
                          />
                          {product?.stock === 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Out of stock</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Order Notes (Optional)</label>
                          <textarea name="notes" rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400" placeholder="Special instructions for delivery..." />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod(PaymentMethod.COD)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${paymentMethod === PaymentMethod.COD
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                              }`}
                          >
                            {paymentMethod === PaymentMethod.COD && (
                              <motion.div layoutId="activePayment" className="absolute inset-0 border-2 border-brand-600 rounded-xl pointer-events-none" />
                            )}
                            <Truck className="w-6 h-6" />
                            <span className="font-semibold text-sm">Cash on Delivery</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod(PaymentMethod.SSLCOMMERZ)}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all relative overflow-hidden ${paymentMethod === PaymentMethod.SSLCOMMERZ
                              ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                              }`}
                          >
                            {paymentMethod === PaymentMethod.SSLCOMMERZ && (
                              <motion.div layoutId="activePayment" className="absolute inset-0 border-2 border-brand-600 rounded-xl pointer-events-none" />
                            )}
                            <CreditCard className="w-6 h-6" />
                            <span className="font-semibold text-sm">Online Payment</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">Total Amount</span>
                          <div className="flex flex-col items-end">
                            {product?.discountAmount > 0 && (
                              <span className="text-sm text-slate-500 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                            <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">
                              {formatPrice(product?.price - (product?.discountAmount || 0))}
                            </span>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group active:scale-[0.98]"
                        >
                          {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <>
                              {paymentMethod === PaymentMethod.SSLCOMMERZ ? 'Pay Now' : 'Place Order'}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 px-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-display">Order Confirmed!</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-10 max-w-xs mx-auto">
                    Thank you for your purchase. We&apos;ve sent a confirmation email to your inbox.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => downloadInvoice(lastOrder)}

                      className="w-full py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"

                    >
                      <Download className="w-5 h-5" />
                      Download Invoice
                    </button>

                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
