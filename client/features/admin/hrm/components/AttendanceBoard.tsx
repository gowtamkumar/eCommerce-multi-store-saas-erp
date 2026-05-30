'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Timer,
  Coffee,
  ArrowUpRight,
  ArrowDownRight,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendanceBoard() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClockToggle = () => {
    setLoading(true);
    setTimeout(() => {
      setIsCheckedIn(!isCheckedIn);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                Geofencing Active
              </span>
              <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                <MapPin className="w-3 h-3" />
                Verified: Main Hub
              </span>
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase mb-2">
              Daily <span className="text-indigo-200">Punch</span>
            </h1>
            <p className="text-indigo-100 font-bold uppercase text-[10px] tracking-[0.25em]">
              Saturday, 16 May 2026 • 07:55 AM
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/20 flex flex-col items-center gap-4 min-w-[280px]">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl">
              <Clock className={`w-10 h-10 ${isCheckedIn ? 'text-rose-500' : 'text-indigo-600'}`} />
            </div>
            <button 
              onClick={handleClockToggle}
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                isCheckedIn 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20' 
                : 'bg-white hover:bg-slate-50 text-indigo-900'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : isCheckedIn ? (
                <>Check Out Now</>
              ) : (
                <>Check In Now</>
              )}
            </button>
            <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">
              {isCheckedIn ? 'Session Active: 4h 12m' : 'Awaiting check-in for today'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
              Session <span className="text-indigo-600">Stats</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Timer className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Scheduled</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">09:00 - 18:00</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Break Time</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">60 Minutes</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Late Minutes</span>
                </div>
                <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">0m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Recent <span className="text-indigo-600">Activity</span>
            </h2>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
              <History className="w-4 h-4" /> View All Logs
            </button>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all rounded-2xl group border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${i % 2 === 0 ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                    {i % 2 === 0 ? <ArrowUpRight className="w-5 h-5 text-rose-500" /> : <ArrowDownRight className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      {i % 2 === 0 ? 'Check Out' : 'Check In'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Hub • IP: 192.168.1.45</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">0{i}:15 PM</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">15 May 2026</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
