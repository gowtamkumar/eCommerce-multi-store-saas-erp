'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Plus,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Link from 'next/link';
import { useHrmDashboard } from '../hooks/useHrmDashboard';

interface StatCardData {
  label: string;
  value: string | number;
  subValue: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

interface StatCardProps {
  stat: StatCardData;
}

const StatCard = ({ stat }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border ${stat.border} dark:border-slate-700 transition-all hover:shadow-lg group`}
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
          {stat.label}
        </p>
        <h3 className={`text-2xl font-black ${stat.color} dark:text-white font-mono`}>
          {stat.value}
        </h3>
      </div>
      <div className={`p-3 ${stat.bg} dark:bg-slate-700 rounded-2xl group-hover:scale-110 transition-transform`}>
        <stat.icon className={`w-5 h-5 ${stat.color}`} />
      </div>
    </div>
    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
      <TrendingUp className="w-3 h-3 text-emerald-500" />
      {stat.subValue}
    </div>
  </motion.div>
);

interface QuickActionProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const QuickAction = ({ label, icon: Icon, href, color }: QuickActionProps) => (
  <Link href={href}>
    <motion.div 
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-750 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:shadow-md transition-all group"
    >
      <div className={`p-2 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:translate-x-1 transition-transform">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
    </motion.div>
  </Link>
);

export default function HrmDashboard() {
  const { stats, chartData, loading } = useHrmDashboard();

  const statCards: StatCardData[] = [
    { 
      label: 'Total Employees', 
      value: stats?.employeeCount ?? 0, 
      subValue: 'Registered personnel', 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100' 
    },
    { 
      label: 'Present Today', 
      value: stats?.attendanceCount ?? 0, 
      subValue: `${Math.round(stats?.attendanceRate ?? 0)}% attendance today`, 
      icon: UserCheck, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100' 
    },
    { 
      label: 'Pending Leaves', 
      value: stats?.leaveCount ?? 0, 
      subValue: 'Requires manager approval', 
      icon: Calendar, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-100' 
    },
    { 
      label: 'Active Jobs', 
      value: stats?.jobCount ?? 0, 
      subValue: `${stats?.applicantCount ?? 0} applicants listed`, 
      icon: Briefcase, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      border: 'border-purple-100' 
    },
  ];

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] animate-pulse">
          Syncing operations log...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
            HRM <span className="text-indigo-600">Operations</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Human Resource Management & Payroll Control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/hrm/employees">
            <button className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Manage Employees
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatCard key={i} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Attendance <span className="text-indigo-600">Trends</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Daily check-in totals for the current week
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 p-1 rounded-xl">
              <button className="px-4 py-1.5 bg-white dark:bg-slate-600 shadow-sm rounded-lg text-[10px] font-black uppercase tracking-widest">Week</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#4f46e5" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAttendance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">
              Quick <span className="text-indigo-600">Actions</span>
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <QuickAction label="Check In/Out" icon={Clock} href="/admin/hrm/attendance" color="bg-indigo-500 text-indigo-500" />
              <QuickAction label="Request Leave" icon={Calendar} href="/admin/hrm/leaves" color="bg-rose-500 text-rose-500" />
              <QuickAction label="Payroll Processing" icon={DollarSign} href="/admin/hrm/payroll" color="bg-emerald-500 text-emerald-500" />
              <QuickAction label="Post New Job" icon={Briefcase} href="/admin/hrm/recruitment" color="bg-amber-500 text-amber-500" />
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-indigo-950 p-8 rounded-[2.5rem] shadow-xl text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Live Insights</h3>
              </div>
              <p className="text-2xl font-black italic mb-4 leading-tight">
                Real-Time Operations <br/>
                <span className="text-indigo-400">across all departments.</span>
              </p>
              <Link href="/admin/hrm/employees">
                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300 hover:text-white transition-colors">
                  View Employees <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
