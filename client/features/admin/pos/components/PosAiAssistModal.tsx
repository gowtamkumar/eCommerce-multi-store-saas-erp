import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles, Copy, Check, ShoppingCart, Coins, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useAiGenerate } from '../../ai/hooks/useAiGenerate';
import type { PosShift, CartItem, Customer } from '../type';

interface PosAiAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  activeShift: PosShift;
  selectedCustomer: Customer | null;
}

type TabType = 'upsell' | 'audit' | 'remarks';

export default function PosAiAssistModal({
  isOpen,
  onClose,
  cart,
  activeShift,
  selectedCustomer,
}: PosAiAssistModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upsell');
  const { configured, loading, generatePosCashierAssist } = useAiGenerate();

  // Upsell state
  const [upsellResult, setUpsellResult] = useState<Array<{ productSuggest: string; pitchExplanation: string }>>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Audit state
  const [auditSteps, setAuditSteps] = useState<string[]>([]);
  const [copiedAudit, setCopiedAudit] = useState(false);

  // Remarks state
  const [remarksContext, setRemarksContext] = useState('');
  const [remarksType, setRemarksType] = useState<'cash_in' | 'cash_out' | 'variance' | 'general'>('variance');
  const [suggestedRemark, setSuggestedRemark] = useState('');
  const [copiedRemark, setCopiedRemark] = useState(false);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setUpsellResult([]);
      setAuditSteps([]);
      setRemarksContext('');
      setSuggestedRemark('');
      setCopiedIndex(null);
      setCopiedAudit(false);
      setCopiedRemark(false);
    }
  }, [isOpen]);

  const handleCopy = (text: string, type: 'upsell' | 'audit' | 'remarks', index?: number) => {
    navigator.clipboard.writeText(text);
    if (type === 'upsell' && typeof index === 'number') {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else if (type === 'audit') {
      setCopiedAudit(true);
      setTimeout(() => setCopiedAudit(false), 2000);
    } else if (type === 'remarks') {
      setCopiedRemark(true);
      setTimeout(() => setCopiedRemark(false), 2000);
    }
  };

  const handleGenerateUpsell = async () => {
    if (cart.length === 0) return;
    const cartSummary = cart
      .map((item) => `${item.quantity}x ${item.product.name}${item.variant ? ` (${Object.values(item.variant.combination).join('/')})` : ''}`)
      .join(', ');

    const customerSummary = selectedCustomer
      ? `Name: ${selectedCustomer.name}, Contact: ${selectedCustomer.phone || selectedCustomer.email || 'N/A'}`
      : 'Walk-in customer';

    const res = await generatePosCashierAssist({
      context: 'upsell',
      cartSummary,
      customerSummary,
    });

    if (res?.upsellSuggestions) {
      setUpsellResult(res.upsellSuggestions);
    }
  };

  const handleGenerateAudit = async () => {
    const shiftSummary = `Opening Balance: $${Number(activeShift.openingBalance).toFixed(2)}, Cash Sales: $${Number(activeShift.cashSales).toFixed(2)}, Cash In: $${Number(activeShift.cashIn || 0).toFixed(2)}, Cash Out: $${Number(activeShift.cashOut || 0).toFixed(2)}, Expected closing: $${Number(activeShift.expectedClosingBalance).toFixed(2)}`;

    const res = await generatePosCashierAssist({
      context: 'reconciliation',
      shiftSummary,
    });

    if (res?.reconciliationSteps) {
      setAuditSteps(res.reconciliationSteps);
    }
  };

  const handleGenerateRemarks = async () => {
    const typeLabel = {
      cash_in: 'Drawer Cash-In (Addition)',
      cash_out: 'Drawer Cash-Out (Withdrawal)',
      variance: 'Shift closing variance discrepancy remarks',
      general: 'POS Transaction adjustment note',
    }[remarksType];

    const transactionSummary = `Type: ${typeLabel}. Cashier Input: "${remarksContext}". Shift details: Opening $${activeShift.openingBalance}, Expected closing $${activeShift.expectedClosingBalance}.`;

    const res = await generatePosCashierAssist({
      context: 'remarks',
      transactionSummary,
    });

    if (res?.suggestedRemarks) {
      setSuggestedRemark(res.suggestedRemarks);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[650px]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-600/10 to-violet-600/10 dark:from-brand-950/20 dark:to-violet-950/20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-500/20 dark:bg-brand-500/30 rounded-xl">
                  <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">POS Cashier AI Assistant</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    Draft-and-approve productivity copilot
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-1 bg-slate-50/50 dark:bg-slate-950/50">
              <button
                onClick={() => setActiveTab('upsell')}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${activeTab === 'upsell'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Upsell Script
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${activeTab === 'audit'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Till Auditor
              </button>
              <button
                onClick={() => setActiveTab('remarks')}
                className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${activeTab === 'remarks'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'text-slate-505 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Remarks Gen
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {configured === false ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                  <h4 className="font-black text-slate-800 dark:text-white text-sm">AI Assist Not Configured</h4>
                  <p className="text-xs text-slate-450 max-w-xs">
                    Please configure your store AI settings and API key under Settings → AI before using the assistant.
                  </p>
                </div>
              ) : (
                <>
                  {/* UPSELL TAB */}
                  {activeTab === 'upsell' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">
                          Current Cart Summary
                        </span>
                        {cart.length === 0 ? (
                          <p className="text-xs font-bold text-red-500">Cart is empty. Add items to get upsell suggestions.</p>
                        ) : (
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                            {cart.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
                          </p>
                        )}
                        {selectedCustomer && (
                          <p className="text-[10px] text-emerald-500 font-bold mt-1.5">
                            Customer: {selectedCustomer.name}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleGenerateUpsell}
                        disabled={loading || cart.length === 0}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Generate Upsell & Cross-sell Pitches
                      </button>

                      {upsellResult.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Suggested Pitch Scripts
                          </span>
                          {upsellResult.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm relative group space-y-2 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                                  Recommend: {item.productSuggest}
                                </span>
                                <button
                                  onClick={() => handleCopy(item.pitchExplanation, 'upsell', idx)}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                                  title="Copy Pitch Script"
                                >
                                  {copiedIndex === idx ? (
                                    <Check className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-350 italic">
                                "{item.pitchExplanation}"
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* AUDIT TAB */}
                  {activeTab === 'audit' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2">
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                          Drawer Shift Context
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-450 block text-[9px] font-bold uppercase">Opening Cash</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">
                              ${Number(activeShift.openingBalance).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-455 block text-[9px] font-bold uppercase">Cash Sales</span>
                            <span className="font-extrabold text-emerald-500">
                              +${Number(activeShift.cashSales).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-450 block text-[9px] font-bold uppercase">Expected Cash</span>
                            <span className="font-extrabold text-brand-500">
                              ${Number(activeShift.expectedClosingBalance).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-455 block text-[9px] font-bold uppercase">Adjustments (In/Out)</span>
                            <span className="font-extrabold text-slate-800 dark:text-white">
                              +${Number(activeShift.cashIn || 0).toFixed(2)} / -${Number(activeShift.cashOut || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateAudit}
                        disabled={loading}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-black rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Coins className="w-4 h-4" />
                        )}
                        Generate Reconciliation Audit Checklist
                      </button>

                      {auditSteps.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              Discrepancy Checklist Steps
                            </span>
                            <button
                              onClick={() => handleCopy(auditSteps.join('\n'), 'audit')}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline"
                            >
                              {copiedAudit ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Checklist
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Entire List
                                </>
                              )}
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {auditSteps.map((step, idx) => (
                              <div
                                key={idx}
                                className="flex gap-3 items-start p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl"
                              >
                                <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-655 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-350 leading-relaxed">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* REMARKS TAB */}
                  {activeTab === 'remarks' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Adjustment Type / Context
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['variance', 'cash_in', 'cash_out', 'general'] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setRemarksType(t)}
                              className={`py-2 px-1 rounded-xl text-center font-bold text-[10px] transition-all capitalize border ${remarksType === t
                                ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'border-slate-200 dark:border-slate-800 text-slate-505 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                                }`}
                            >
                              {t.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Cashier Context / Short Notes
                        </label>
                        <textarea
                          placeholder="Provide a quick details note (e.g. 'short of $10 counting error', 'Tea payout for office staff', 'returned damaged shirt')..."
                          value={remarksContext}
                          onChange={(e) => setRemarksContext(e.target.value)}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none text-xs text-slate-900 dark:text-white h-20 resize-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>

                      <button
                        onClick={handleGenerateRemarks}
                        disabled={loading || !remarksContext.trim()}
                        className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        Generate Compliant Remarks Draft
                      </button>

                      {suggestedRemark && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              Generated Remarks Draft
                            </span>
                            <button
                              onClick={() => handleCopy(suggestedRemark, 'remarks')}
                              className="inline-flex items-center gap-1 text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline"
                            >
                              {copiedRemark ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Draft
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy Draft
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed italic">
                              "{suggestedRemark}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-black text-slate-655 hover:bg-white dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                Close Assistant
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
