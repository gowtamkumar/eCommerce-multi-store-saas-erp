'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Loader2,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAiGenerate } from '@/features/admin/ai/hooks/useAiGenerate';
import type { LeaveFaqResult } from '@/features/admin/ai/types/ai-studio';

interface AiLeavePolicyFaqModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill policy summary (optional) */
  policySummary?: string;
  /** Company name for the FAQ title */
  companyName?: string;
}

export function AiLeavePolicyFaqModal({
  open,
  onClose,
  policySummary: initialPolicy = '',
  companyName,
}: AiLeavePolicyFaqModalProps) {
  const { generateLeaveFaq, loading, configured } = useAiGenerate();
  const [policy, setPolicy] = useState(initialPolicy);
  const [seedQ, setSeedQ] = useState('');
  const [audience, setAudience] = useState('all employees');
  const [result, setResult] = useState<LeaveFaqResult | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const handleGenerate = async () => {
    if (!policy.trim()) {
      toast.error('Please enter a leave policy summary.');
      return;
    }
    const seedQuestions = seedQ
      .split('\n')
      .map((q) => q.trim())
      .filter(Boolean);
    const data = await generateLeaveFaq({
      policySummary: policy.trim(),
      seedQuestions: seedQuestions.length ? seedQuestions : undefined,
      audience: audience.trim() || undefined,
      companyName: companyName?.trim() || undefined,
    });
    if (data) setResult(data);
  };

  const copyAll = () => {
    if (!result) return;
    const text = [
      result.title,
      result.intro ? `\n${result.intro}` : '',
      '',
      ...result.faqs.flatMap((f) => [`Q: ${f.question}`, `A: ${f.answer}`, '']),
      ...(result.reviewNotes.length ? ['⚠️ Review Notes:', ...result.reviewNotes.map((n) => `• ${n}`)] : []),
    ]
      .join('\n')
      .trim();
    navigator.clipboard.writeText(text);
    toast.success('FAQ copied to clipboard');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight italic">
                  Leave Policy FAQ Generator
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Draft only · HR reviews before publishing
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {!configured && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
                    AI is not configured. Go to Settings → AI Configuration to set up a provider.
                  </p>
                </div>
              )}

              {/* Policy input */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Leave Policy Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={policy}
                  onChange={(e) => setPolicy(e.target.value)}
                  rows={6}
                  placeholder="Paste or type your leave policy here — types of leave, accrual rules, eligibility, approval process, carryover, etc."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
                />
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Target Audience
                </label>
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. all employees, managers, contractors"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Seed questions */}
              <div className="space-y-1.5">
                <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Seed Questions <span className="text-slate-400 font-normal">(optional, one per line)</span>
                </label>
                <textarea
                  value={seedQ}
                  onChange={(e) => setSeedQ(e.target.value)}
                  rows={3}
                  placeholder={"Can I carry over unused leave?\nHow do I apply for parental leave?"}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
                />
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !configured || !policy.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Generating FAQs…' : 'Generate FAQ Draft'}
              </button>

              {/* Results */}
              {result && (
                <div className="space-y-4 pt-2">
                  {/* Title + intro */}
                  <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-indigo-900 dark:text-indigo-100 text-sm">{result.title}</p>
                        {result.intro && (
                          <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">{result.intro}</p>
                        )}
                      </div>
                      <button
                        onClick={copyAll}
                        className="shrink-0 p-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-500 transition-colors"
                        title="Copy all FAQ"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* FAQ accordion */}
                  <div className="space-y-2">
                    {result.faqs.map((faq, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm flex-1 min-w-0">
                            <span className="text-indigo-500 font-black mr-2">Q{i + 1}.</span>
                            {faq.question}
                          </span>
                          {expandedIdx === i ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {expandedIdx === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4">
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-l-2 border-indigo-300 pl-3">
                                  {faq.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Review notes */}
                  {result.reviewNotes.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                          HR Review Reminders
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {result.reviewNotes.map((note, i) => (
                          <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
                            <span className="shrink-0 mt-0.5">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <p className="text-xs text-slate-400 flex-1">
                Generated content is a draft. HR must review before publishing to employees.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
