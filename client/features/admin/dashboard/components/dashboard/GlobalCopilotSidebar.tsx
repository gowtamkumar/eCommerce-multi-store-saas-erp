"use client";

import { Bot, Loader2, Send, Sparkles, Trash2, Wrench, X } from "lucide-react";
import { FormEvent, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminCopilot } from "../../hooks/useAdminCopilot";
import { AiSetupBanner } from "@/features/admin/ai/components/AiChatPanel";
import Link from "next/link";

const SUGGESTED_QUESTIONS = [
  "Show my 5 most recent pending orders",
  "Which products are low on stock?",
  "Summarize this month's dashboard KPIs",
  "Look up stock for SKU in my catalog",
];

interface GlobalCopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalCopilotSidebar({ isOpen, onClose }: GlobalCopilotSidebarProps) {
  const { configured, loading, messages, sendMessage, clearMessages } = useAdminCopilot();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || configured === false) return;
    const value = input;
    setInput("");
    await sendMessage(value);
  };

  const disabled = configured === false;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end print:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Drawer Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                    Admin Copilot
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Read-only catalog & ERP assistant
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {configured === false ? (
                <AiSetupBanner configured={false} />
              ) : (
                <>
                  {/* Suggested questions */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Suggested Queries
                    </p>
                    <div className="grid gap-2">
                      {SUGGESTED_QUESTIONS.map((question) => (
                        <button
                          key={question}
                          type="button"
                          disabled={loading || disabled}
                          onClick={() => void sendMessage(question)}
                          className="text-left text-xs font-semibold px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat bubbles wrapper */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-center text-slate-400 py-12">
                        <Sparkles className="w-8 h-8 mb-2 text-violet-500/60" />
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          Ask across orders and inventory
                        </p>
                        <p className="text-[10px] uppercase tracking-widest mt-1.5 max-w-xs leading-normal">
                          The copilot calls live read-only tools before answering.
                        </p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isUser = message.role === "user";
                        return (
                          <div
                            key={`${message.role}-${index}`}
                            className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${isUser
                                  ? "bg-violet-600 text-white rounded-tr-none shadow-md"
                                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800"
                                }`}
                            >
                              {message.content}

                              {/* Tool use display */}
                              {!isUser && message.toolsUsed?.length ? (
                                <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                                  {message.toolsUsed.map((tool) => (
                                    <span
                                      key={`${tool.tool}-${index}`}
                                      className="inline-flex items-center gap-1 rounded-lg bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                                    >
                                      <Wrench className="w-2.5 h-2.5" />
                                      {tool.tool}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </div>

            {/* Chat Input Form */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
              <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || disabled}
                  placeholder="Ask about orders, stock, or KPIs..."
                  className="flex-1 px-4 py-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading || disabled || !input.trim()}
                  className="inline-flex items-center justify-center p-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50 transition-all shadow-md shadow-violet-500/20 active:scale-95 shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
                {messages.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearMessages}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:text-rose-500 hover:border-rose-200 transition-colors"
                    title="Clear Conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null}
              </form>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>Safe Read-Only Operations Only</span>
                <Link
                  href="/admin/settings?tab=ai"
                  onClick={onClose}
                  className="text-brand-600 hover:underline"
                >
                  Configure AI Settings
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
