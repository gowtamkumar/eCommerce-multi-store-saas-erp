'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Users, 
  ArrowRight,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const PIPELINE_STAGES = [
  { id: 'applied', label: 'Applied', count: 24, color: 'border-slate-200 bg-slate-50' },
  { id: 'screening', label: 'Screening', count: 12, color: 'border-blue-200 bg-blue-50' },
  { id: 'interview', label: 'Interview', count: 8, color: 'border-amber-200 bg-amber-50' },
  { id: 'technical', label: 'Technical', count: 4, color: 'border-purple-200 bg-purple-50' },
  { id: 'offer', label: 'Offer', count: 2, color: 'border-emerald-200 bg-emerald-50' },
];

const MOCK_APPLICANTS = [
  { id: 'APP-001', name: 'John Doe', job: 'Senior Accountant', stage: 'interview', date: '2h ago' },
  { id: 'APP-002', name: 'Jane Smith', job: 'Warehouse Manager', stage: 'screening', date: '5h ago' },
  { id: 'APP-003', name: 'Michael Chen', job: 'Logistics Lead', stage: 'technical', date: '1d ago' },
  { id: 'APP-004', name: 'Sarah Wilson', job: 'Sales Executive', stage: 'applied', date: '2d ago' },
];

export default function RecruitmentBoard({ onViewApplicant }: { onViewApplicant: (app: any) => void }) {
  const [view, setView] = useState<'pipeline' | 'jobs'>('pipeline');

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Talent <span className="text-indigo-600">Acquisition</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">
            Managing 48 active applications across 6 job openings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mr-4">
            <button 
              onClick={() => setView('pipeline')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'pipeline' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Pipeline
            </button>
            <button 
              onClick={() => setView('jobs')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'jobs' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
            >
              Job Postings
            </button>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>
      </div>

      {view === 'pipeline' ? (
        <>
          {/* Pipeline Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.id} className="space-y-4">
                <div className={`p-4 rounded-2xl border-2 ${stage.color} flex items-center justify-between`}>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">{stage.label}</span>
                  <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-black shadow-sm">{stage.count}</span>
                </div>
                
                <div className="space-y-3">
                  {MOCK_APPLICANTS.filter(a => a.stage === stage.id).map((applicant, i) => (
                    <motion.div 
                      key={applicant.id}
                      whileHover={{ y: -2 }}
                      onClick={() => onViewApplicant(applicant)}
                      className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-[10px]">
                          {applicant.name.charAt(0)}
                        </div>
                        <button className="text-slate-300 hover:text-slate-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1">{applicant.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 line-clamp-1">{applicant.job}</p>
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-50 dark:border-slate-700">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{applicant.date}</span>
                      </div>
                    </motion.div>
                  ))}
                  <button className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700 text-slate-300 hover:border-slate-200 hover:text-slate-400 transition-all flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search job postings..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort by:</span>
              <button className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest">Newest</button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {[
              { title: 'Senior Accountant', dept: 'Finance', applicants: 12, status: 'Active', posted: '2 days ago' },
              { title: 'Warehouse Picker', dept: 'Logistics', applicants: 24, status: 'Active', posted: '5 days ago' },
              { title: 'Logistics Lead', dept: 'Logistics', applicants: 8, status: 'Draft', posted: '1 week ago' },
              { title: 'Sales Executive', dept: 'Sales', applicants: 4, status: 'Closed', posted: '2 weeks ago' },
            ].map((job, i) => (
              <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.dept} • Posted {job.posted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-900 dark:text-white">{job.applicants}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Applicants</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    job.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    job.status === 'Draft' ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                    'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {job.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
