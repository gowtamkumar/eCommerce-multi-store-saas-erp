'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import {
  X,
  Mail,
  Phone,
  FileText,
  Download,
  Calendar,
  Clock,
  User,
  Star,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApplicantDetails({
  applicant,
  isOpen,
  onClose
}: any) {
  if (!applicant) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col"
          >
            {/* Header */}
            <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <button
                onClick={onClose}
                className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl font-black italic">
                  {applicant.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-indigo-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {applicant.stage}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                    {applicant.name}
                  </h2>
                  <p className="text-indigo-300 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                    Applying for: {applicant.job}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              {/* Pipeline Status */}
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 italic">Hiring Pipeline</h3>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 -z-10"></div>
                  {['Applied', 'Screening', 'Interview', 'Offer'].map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-[10px] font-black ${applicant.stage.toLowerCase() === step.toLowerCase()
                          ? 'bg-indigo-600 border-indigo-100 text-white shadow-lg'
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300'
                        }`}>
                        {i + 1}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{step}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Resume & Documents */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">Credentials</h3>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download All
                  </button>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Curriculum Vitae</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Updated 3 days ago • PDF (1.4MB)</p>
                    </div>
                  </div>
                  <button className="p-3 text-slate-300 hover:text-indigo-600 transition-colors">
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* Internal Notes */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">Internal Feedback</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-l-4 border-indigo-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <Star className="w-3 h-3 text-slate-200 fill-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 ml-2">4.0 / 5.0</span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      &ldquo;Candidate showed strong technical aptitude in React and Node.js. Communication was clear, though a bit nervous during the architectural round.&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-[9px] font-black text-indigo-600">TH</div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thomas H. • Lead Architect</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Actions */}
            <div className="p-10 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4">
              <button className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2">
                Move to Next Stage <ArrowRight className="w-3 h-3" />
              </button>
              <button className="px-8 py-4 bg-white dark:bg-slate-800 text-rose-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest border border-slate-100 dark:border-slate-700 hover:bg-rose-50 transition-all">
                Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
