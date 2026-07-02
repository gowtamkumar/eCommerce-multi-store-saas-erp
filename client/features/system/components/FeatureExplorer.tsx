'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  badge: string;
}

export default function FeatureExplorer() {
  const [activeTab, setActiveTab] = useState('pos');

  const tabs: TabConfig[] = [
    { id: 'pos', label: 'POS Checkout', icon: Icons.ShoppingCart, color: 'from-brand-500 to-indigo-600', badge: 'High Performance' },
    { id: 'inventory', label: 'Inventory & WH', icon: Icons.Package, color: 'from-blue-500 to-sky-600', badge: 'Real-time Tracking' },
    { id: 'hrm', label: 'HRM & Collaboration', icon: Icons.Users, color: 'from-emerald-500 to-teal-600', badge: 'Roster & Shifts' },
    { id: 'analytics', label: 'Multi-store Analytics', icon: Icons.BarChart3, color: 'from-amber-500 to-orange-600', badge: 'Global Insights' }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/40 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-4 py-1.5 rounded-full border border-brand-100 dark:border-brand-900/40">
            Interactive Product Tour
          </span>
          <h2 className="text-3xl lg:text-5xl font-black font-display text-slate-900 dark:text-white mt-6 mb-4 tracking-tight">
            Designed for <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Seamless Control</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium text-sm sm:text-base">
            Click through our core modules below to preview how our ERP coordinates complex retail operations under a single, unified interface.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto bg-slate-100 dark:bg-slate-800/40 p-1.5 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 shadow-inner">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeExplorerTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl shadow-lg shadow-brand-500/10`}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10 shrink-0" />
                <span className="relative z-10">{tab.label}</span>
                <span className={`relative z-10 text-[8px] px-1.5 py-0.5 rounded-full font-black normal-case border ${
                  isActive 
                    ? 'bg-white/20 border-white/20 text-white' 
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Window */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-950/40 max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-850">
            <div className="flex gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-display">
              Live Demo: {tabs.find(t => t.id === activeTab)?.label}
            </span>
            <div className="w-10" />
          </div>

          <div className="p-6 sm:p-10 min-h-[460px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                {activeTab === 'pos' && <POSDemo />}
                {activeTab === 'inventory' && <InventoryDemo />}
                {activeTab === 'hrm' && <HRMDemo />}
                {activeTab === 'analytics' && <AnalyticsDemo />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Simulated Sub-components */

function POSDemo() {
  const [items, setItems] = useState([
    { id: 1, name: 'Sleek Keyboard', qty: 1, price: 59.99 },
    { id: 2, name: 'Premium Mouse', qty: 2, price: 34.50 },
    { id: 3, name: 'Bluetooth Headset', qty: 1, price: 120.00 }
  ]);

  const total = items.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);

  const updateQty = (id: number, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(i => i.qty > 0));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-slate-200">
      <div className="md:col-span-8 flex flex-col gap-4 text-left">
        <h4 className="font-black text-white text-base font-display">Active Checkout Cart</h4>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-xs sm:text-sm text-white">{item.name}</span>
                <div className="text-[10px] text-slate-400 mt-0.5">${item.price} each</div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <button onClick={() => updateQty(item.id, -1)} className="text-slate-400 hover:text-white font-bold cursor-pointer">-</button>
                <span className="text-xs font-black text-white w-4 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="text-slate-400 hover:text-white font-bold cursor-pointer">+</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-sm">Cart is empty. Click +/- to reset items.</div>
          )}
        </div>
      </div>
      
      <div className="md:col-span-4 p-5 rounded-3xl bg-slate-950/60 border border-slate-800/80 text-left flex flex-col justify-between min-h-[300px]">
        <div className="space-y-4">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Order Summary</div>
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>VAT / Tax (15%)</span>
              <span>${(total * 0.15).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline pt-2">
            <span className="font-black text-xs text-white uppercase tracking-wider">Total Amount</span>
            <span className="text-xl font-black text-brand-400">${(total * 1.15).toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={() => alert('Demo checkout completed!')}
          disabled={items.length === 0}
          className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-500/25 active:scale-95 disabled:opacity-40 cursor-pointer text-center"
        >
          Pay & Print Invoice
        </button>
      </div>
    </div>
  );
}

function InventoryDemo() {
  const stockItems = [
    { sku: 'SKU-8921', name: 'Premium Ergonomic Desk', stock: 142, status: 'Healthy', color: 'bg-emerald-500/20 text-emerald-400' },
    { sku: 'SKU-3140', name: 'UltraWide Curved Monitor', stock: 12, status: 'Reorder Low', color: 'bg-rose-500/20 text-rose-400' },
    { sku: 'SKU-5441', name: 'Thunderbolt 4 Docking Station', stock: 85, status: 'Healthy', color: 'bg-emerald-500/20 text-emerald-400' },
    { sku: 'SKU-1025', name: 'Noise Cancelling Headphones', stock: 0, status: 'Out of Stock', color: 'bg-slate-800 text-slate-400' }
  ];

  return (
    <div className="space-y-6 text-left text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="font-black text-white text-base font-display">Inventory Logs & Warehousing</h4>
          <p className="text-xs text-slate-400">Track and manage batches, low stock notifications across locations.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300">
          <Icons.Store className="w-3.5 h-3.5 text-brand-400" />
          Warehouse: Downtown Depot
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-850 bg-slate-950/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
              <th className="py-4 px-6 text-left">SKU CODE</th>
              <th className="py-4 px-6 text-left">PRODUCT NAME</th>
              <th className="py-4 px-6 text-center">STOCKS</th>
              <th className="py-4 px-6 text-center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {stockItems.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-850 hover:bg-slate-950/20 text-xs font-bold text-slate-300">
                <td className="py-4 px-6 font-mono text-slate-400">{item.sku}</td>
                <td className="py-4 px-6 text-white">{item.name}</td>
                <td className="py-4 px-6 text-center">{item.stock} Units</td>
                <td className="py-4 px-6 text-center">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${item.color}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HRMDemo() {
  const staff = [
    { name: 'Sarah Connor', role: 'Branch Manager', checkIn: '08:45 AM', status: 'Active', color: 'bg-emerald-500 text-emerald-500' },
    { name: 'Alex Mercer', role: 'POS Cashier', checkIn: '09:02 AM', status: 'Active', color: 'bg-emerald-500 text-emerald-500' },
    { name: 'Elena Fisher', role: 'Inventory Officer', checkIn: '-', status: 'Absent', color: 'bg-slate-700 text-slate-500' }
  ];

  return (
    <div className="space-y-6 text-left text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h4 className="font-black text-white text-base font-display">Staff Attendance & HRM Rosters</h4>
          <p className="text-xs text-slate-400">Monitor employee check-in timelines and role assignments in real time.</p>
        </div>
        <div className="px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-bold text-slate-300">
          Live Clock-In Portal
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {staff.map((employee, idx) => (
          <div key={idx} className="p-5 rounded-2.5xl bg-slate-950/40 border border-slate-800/80 flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-black text-white">{employee.name}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{employee.role}</div>
              </div>
              <span className={`flex h-2 w-2 relative rounded-full ${employee.color.replace('text-', 'bg-')}`}>
                {employee.status === 'Active' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-slate-850/60 mt-4 text-[10px] font-black uppercase text-slate-400">
              <span>Roster Time</span>
              <span className={employee.checkIn === '-' ? 'text-slate-650' : 'text-emerald-400'}>
                {employee.checkIn}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  return (
    <div className="space-y-6 text-left text-slate-200">
      <div>
        <h4 className="font-black text-white text-base font-display">Global Multi-store Sales Analytics</h4>
        <p className="text-xs text-slate-400">Collectively check transactions, conversion cycles, and brand channels.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2.5xl bg-slate-950/40 border border-slate-800">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Monthly Target Progress</div>
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-2xl font-black text-white">$124,500</span>
            <span className="text-xs font-bold text-slate-400">Goal: $150,000 (83%)</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-850 h-3 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '83%' }}
              transition={{ duration: 1.2 }}
              className="bg-gradient-to-r from-brand-600 to-indigo-600 h-full rounded-full"
            />
          </div>
        </div>

        <div className="p-6 rounded-2.5xl bg-slate-950/40 border border-slate-800/80 flex flex-col justify-between">
          <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Conversion Funnel</div>
          <div className="flex justify-between text-xs font-bold text-slate-350">
            <span>Visits</span>
            <span className="text-white">45,820</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-350 mt-1.5">
            <span>Checkout Initiations</span>
            <span className="text-white">12,400 (27%)</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-brand-400 mt-1.5">
            <span>Completed Purchase</span>
            <span className="text-brand-400">4,892 (10.6%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
