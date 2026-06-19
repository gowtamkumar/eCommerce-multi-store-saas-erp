'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Sparkles,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAiGenerate } from '@/features/admin/ai/hooks/useAiGenerate';
import type { ApplicantScreeningResult, ApplicantScreeningStage } from '@/features/admin/ai/types/ai-studio';

interface AiScreeningPanelProps {
  jobTitle: string;
}

function AiScreeningPanel({ jobTitle }: AiScreeningPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { generateApplicantScreening, loading, configured } = useAiGenerate();

  const [jobSummary, setJobSummary] = useState(
    `Target Role: ${jobTitle}\nFocus on standard screening questions, role qualifications, and relevant experience.`
  );
  const [stage, setStage] = useState<ApplicantScreeningStage>('technical');
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<ApplicantScreeningResult | null>(null);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState<number | null>(null);

  // Sync jobSummary when jobTitle changes
  useEffect(() => {
    setJobSummary(
      `Target Role: ${jobTitle}\nFocus on standard screening questions, role qualifications, and relevant experience.`
    );
    setResult(null);
  }, [jobTitle]);

  const handleGenerate = async () => {
    if (!jobSummary.trim()) return;
    const res = await generateApplicantScreening({
      jobSummary: jobSummary.trim(),
      stage,
      count,
    });
    if (res) {
      setResult(res);
      setExpandedQuestionIdx(0);
    }
  };

  const copyQuestions = () => {
    if (!result) return;
    const text = [
      `Screening Questions for ${jobTitle} (${stage} stage)`,
      `Suggested Duration: ${result.suggestedDurationMinutes} minutes`,
      '',
      ...result.questions.flatMap((q, idx) => [
        `${idx + 1}. [${q.category}] ${q.question}`,
        q.interviewerGuide ? `   Interviewer Guide: ${q.interviewerGuide}` : '',
        ''
      ]),
      ...(result.complianceNotes?.length
        ? ['Compliance Notes:', ...result.complianceNotes.map((n) => `• ${n}`)]
        : [])
    ]
      .join('\n')
      .trim();

    navigator.clipboard.writeText(text);
    import('react-hot-toast').then(({ default: toast }) => {
      toast.success('Screening questions copied!');
    });
  };

  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 overflow-hidden transition-all">
      {/* Panel Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">
              AI Interview Screening
            </h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Generate stage-specific tailored questions
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
          >
            <div className="p-6 space-y-4">
              {!configured && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-bold leading-relaxed">
                    AI is not configured. Go to Settings → AI Configuration to set up a provider.
                  </p>
                </div>
              )}

              {/* Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Job Summary & Details
                </label>
                <textarea
                  value={jobSummary}
                  onChange={(e) => setJobSummary(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
                  placeholder="Summarize the job description, skills needed, etc..."
                />
              </div>

              {/* Stage Select & Count Slider */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Interview Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as ApplicantScreeningStage)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="initial">Initial Screen</option>
                    <option value="technical">Technical Assessment</option>
                    <option value="cultural_fit">Cultural Fit</option>
                    <option value="final">Final Interview</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Questions Count
                    </label>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{count}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full accent-indigo-600 mt-2"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !configured || !jobSummary.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Generating screening questions...' : 'Generate Questions'}
              </button>

              {/* Results */}
              {result && (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                    <span className="text-[10px] font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                      Suggested Duration: {result.suggestedDurationMinutes} mins
                    </span>
                    <button
                      onClick={copyQuestions}
                      className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline flex items-center gap-1"
                    >
                      Copy All
                    </button>
                  </div>

                  {/* Question list */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.questions.map((q, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedQuestionIdx(expandedQuestionIdx === idx ? null : idx)}
                          className="w-full flex items-start justify-between gap-3 p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="inline-block px-1.5 py-0.5 mb-1 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              {q.category}
                            </span>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              <span className="text-indigo-500 font-black mr-1">{idx + 1}.</span>
                              {q.question}
                            </p>
                          </div>
                          {expandedQuestionIdx === idx ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {expandedQuestionIdx === idx && q.interviewerGuide && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3.5 pb-3.5 border-t border-slate-50 dark:border-slate-800/50 pt-2 bg-slate-50/50 dark:bg-slate-800/20">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                  Interviewer Guide / Look For
                                </p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                  {q.interviewerGuide}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Compliance Notes */}
                  {result.complianceNotes && result.complianceNotes.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="text-[9px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Compliance & PII Guardrails
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {result.complianceNotes.map((note, i) => (
                          <li key={i} className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-normal">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
                    <span className="px-3 py-1 bg-indigo-50 rounded-full text-[9px] font-black uppercase tracking-widest">
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

              {/* AI Interview Screening Section */}
              <section>
                <AiScreeningPanel jobTitle={applicant.job} />
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
