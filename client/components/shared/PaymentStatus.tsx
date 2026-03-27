'use client';

import { useDownloadInvoice } from '@/lib/handleDownloadInvoice';
import { OrderStatus } from '@/lib/enums/order-status.enum';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Download, Loader2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const PaymentStatusContent = () => {
  const { downloadInvoice } = useDownloadInvoice();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const orderIdParam = searchParams.get('orderId');

    if (statusParam) {
      setActiveStatus(statusParam);
      setActiveOrderId(orderIdParam);
      setIsOpen(true);

      // Clean up URL but keep it in memory for the modal
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeStatus === 'success' && activeOrderId) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/orders/${activeOrderId}`);
          if (res.ok) {
            const data = await res.json();
            setOrder(data.order);
          }
        } catch (error) {
          console.error('Failed to fetch order details:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [activeStatus, activeOrderId]);

  const close = () => {
    setIsOpen(false);
    setActiveStatus(null);
    setActiveOrderId(null);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && activeStatus && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-[60] backdrop-blur-md"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-slate-900 w-full max-w-md p-8 rounded-3xl shadow-2xl pointer-events-auto border border-white/20 dark:border-slate-700 text-center relative overflow-hidden">
              {activeStatus === 'success' ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 font-display">Payment Successful!</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-10 max-w-xs mx-auto text-lg leading-relaxed">
                    Your order has been processed successfully. You can now download your invoice below.
                  </p>

                  <div className="flex flex-col gap-4">
                    {order ? (
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 active:scale-[0.98]"
                      >
                        <Download className="w-5 h-5" />
                        Download Invoice
                      </button>
                    ) : loading ? (
                      <div className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    ) : null}

                    <button
                      onClick={close}
                      className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
                    >
                      Close Window
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <X className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-display">Payment Failed</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-8">
                    {activeStatus === OrderStatus.CANCELLED ? 'You cancelled the payment.' : 'Something went wrong with the payment. Please try again.'}
                  </p>
                  <button
                    onClick={close}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const PaymentStatus = () => {
  return (
    <Suspense fallback={null}>
      <PaymentStatusContent />
    </Suspense>
  );
};

export default PaymentStatus;
