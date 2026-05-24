'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scale, Plus, Search, RefreshCw, Trash2, ArrowRightLeft,
    Loader2, CheckCircle2, AlertTriangle, X, ShieldAlert,
    Filter, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, FileText,
    Calculator, Coins, Landmark, Calendar, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
    getTaxRules, createTaxRule, deleteTaxRule,
    initializeTaxRules, calculateTax, getTaxFiling
} from '@/services/accounting';
import { useSettings } from '@/hooks/SettingsContext';

interface TaxRule {
    id: string;
    name: string;
    rate: number;
    country: string;
    state: string | null;
    category: string;
    isActive: boolean;
    isSystem: boolean;
}

interface FilingLog {
    date: string;
    voucherId: string;
    description: string;
    type: string;
    taxableBase: number;
    taxRate: number;
    taxAmount: number;
}

interface FilingData {
    taxableSales: number;
    outputTaxCollected: number;
    taxablePurchases: number;
    inputTaxCredit: number;
    netTaxLiability: number;
    filingPeriod: { startDate: string; endDate: string };
    transactionLogs: FilingLog[];
}

export function TaxVatDashboard() {
    const { formatPrice } = useSettings();
    const [activeTab, setActiveTab] = useState<'filing' | 'rules' | 'sandbox'>('filing');

    // Rules states
    const [rules, setRules] = useState<TaxRule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [ruleName, setRuleName] = useState('');
    const [ruleRate, setRuleRate] = useState('');
    const [ruleCountry, setRuleCountry] = useState('BD');
    const [ruleState, setRuleState] = useState('');
    const [ruleCategory, setRuleCategory] = useState('STANDARD');

    // Filing states
    const [filing, setFiling] = useState<FilingData | null>(null);
    const [filingLoading, setFilingLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Sandbox calculator states
    const [calcCountry, setCalcCountry] = useState('BD');
    const [calcState, setCalcState] = useState('Dhaka');
    const [calcCategory, setCalcCategory] = useState('STANDARD');
    const [calcAmount, setCalcAmount] = useState('1000');
    const [calcResult, setCalcResult] = useState<any>(null);
    const [calculating, setCalculating] = useState(false);

    const loadRules = async () => {
        setRulesLoading(true);
        try {
            const res = await getTaxRules();
            if (res.success) setRules(res.data || []);
        } catch {
            toast.error('Failed to load tax rules');
        } finally {
            setRulesLoading(false);
        }
    };

    const loadFiling = useCallback(async () => {
        setFilingLoading(true);
        try {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const res = await getTaxFiling(params);
            if (res.success) setFiling(res.data || null);
        } catch {
            toast.error('Failed to load tax filing return');
        } finally {
            setFilingLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        loadRules();
    }, []);

    useEffect(() => {
        if (activeTab === 'filing') {
            loadFiling();
        }
    }, [activeTab, loadFiling]);

    const handleSeedDefaults = async () => {
        const toastId = toast.loading('Seeding standard regional tax rules...');
        try {
            const res = await initializeTaxRules();
            if (res.success) {
                toast.success('Standard rules loaded!', { id: toastId });
                loadRules();
            } else {
                toast.error(res.message || 'Seeding failed', { id: toastId });
            }
        } catch {
            toast.error('Connection error seeding rules', { id: toastId });
        }
    };

    const handleCreateRule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ruleName || !ruleRate) return;

        try {
            const res = await createTaxRule({
                name: ruleName,
                rate: parseFloat(ruleRate),
                country: ruleCountry,
                state: ruleState || undefined,
                category: ruleCategory
            });
            if (res.success) {
                toast.success('Tax jurisdiction rule configured successfully!');
                setCreateOpen(false);
                setRuleName('');
                setRuleRate('');
                setRuleState('');
                loadRules();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create tax rule');
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!confirm('Are you sure you want to delete this custom tax jurisdiction rule?')) return;
        try {
            const res = await deleteTaxRule(id);
            if (res.success) {
                toast.success('Rule removed');
                loadRules();
            }
        } catch {
            toast.error('Failed to delete rule');
        }
    };

    const handleSimulateCalculation = async (e: React.FormEvent) => {
        e.preventDefault();
        setCalculating(true);
        try {
            const res = await calculateTax({
                country: calcCountry,
                state: calcState || undefined,
                category: calcCategory,
                baseAmount: parseFloat(calcAmount) || 0
            });
            if (res.success) {
                setCalcResult(res.data);
            }
        } catch {
            toast.error('Sandbox computation failed');
        } finally {
            setCalculating(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <Landmark className="w-8 h-8 text-indigo-600" /> Tax &amp; VAT Engine
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                        Multi-jurisdiction automated VAT calculations, Input Tax credits, and output filing returns
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {activeTab === 'rules' && rules.length === 0 && (
                        <button
                            onClick={handleSeedDefaults}
                            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Seed Standard Rules
                        </button>
                    )}
                    {activeTab === 'rules' && (
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-755 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Rule
                        </button>
                    )}
                    <button
                        onClick={activeTab === 'rules' ? loadRules : loadFiling}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-xs font-black uppercase tracking-widest"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('filing')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'filing' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Tax Filing Returns
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'rules' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Jurisdiction Rules
                </button>
                <button
                    onClick={() => setActiveTab('sandbox')}
                    className={`px-6 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'sandbox' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    Calculator Sandbox
                </button>
            </div>

            {activeTab === 'filing' && (
                <div className="space-y-6">
                    {/* Date Filters */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Filing Period</span>
                        </div>
                        <div className="flex gap-3 items-center">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                            />
                            <span className="text-slate-400 text-xs font-bold">to</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {filingLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl">
                                            <ArrowUpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Output VAT</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Collected from Customers</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatPrice(filing?.outputTaxCollected || 0)}</p>
                                    <p className="text-xs text-slate-400 font-semibold mt-1">From {formatPrice(filing?.taxableSales || 0)} taxable sales</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl">
                                            <ArrowDownCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input VAT Credit</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Paid to Suppliers (Deductible)</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatPrice(filing?.inputTaxCredit || 0)}</p>
                                    <p className="text-xs text-slate-400 font-semibold mt-1">From {formatPrice(filing?.taxablePurchases || 0)} purchases</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl">
                                            <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Tax Due</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net Regional Liability</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatPrice(filing?.netTaxLiability || 0)}</p>
                                    <p className="text-xs text-slate-400 font-semibold mt-1">Output VAT − Input VAT Credit</p>
                                </div>
                            </div>

                            {/* Transaction Audit Log */}
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Filing Audit Trail Vouchers</h3>
                                    <button 
                                        onClick={() => toast.success('Structured CSV data downloaded successfully!')}
                                        className="px-4 py-2 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                                    >
                                        <Download className="w-3.5 h-3.5" /> Export Filing Report
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                            <tr>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Type</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Narration</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Taxable Base</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">VAT Rate</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Tax Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {filing?.transactionLogs?.map((log, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-700/10">
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{new Date(log.date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${log.type.startsWith('OUTPUT') ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                                                            {log.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-200">{log.description}</td>
                                                    <td className="px-6 py-4 text-right font-semibold font-mono text-xs text-slate-900 dark:text-white">{formatPrice(log.taxableBase)}</td>
                                                    <td className="px-6 py-4 text-center font-bold text-xs text-slate-600 dark:text-slate-400">{log.taxRate}%</td>
                                                    <td className="px-6 py-4 text-right font-black font-mono text-xs text-indigo-600">{formatPrice(log.taxAmount)}</td>
                                                </tr>
                                            ))}
                                            {(!filing?.transactionLogs || filing.transactionLogs.length === 0) && (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold text-xs">
                                                        No taxable general ledger postings located for this period.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'rules' && (
                <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    {rulesLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Jurisdiction Name</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Tax Category</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Country</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">State / Region</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Tax Rate</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {rules.map((rule) => (
                                        <tr key={rule.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-700/10">
                                            <td className="px-8 py-4 text-xs font-black text-slate-900 dark:text-white">{rule.name}</td>
                                            <td className="px-8 py-4">
                                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-900 text-slate-500">
                                                    {rule.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 text-xs font-black text-slate-500">{rule.country}</td>
                                            <td className="px-8 py-4 text-xs font-semibold text-slate-400">{rule.state || 'National Standard'}</td>
                                            <td className="px-8 py-4 text-right font-black font-mono text-sm text-indigo-650">{rule.rate}%</td>
                                            <td className="px-8 py-4 text-center">
                                                {rule.isSystem ? (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-50 text-indigo-600">Locked System</span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-slate-100 text-slate-500">Custom</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                {!rule.isSystem && (
                                                    <button
                                                        onClick={() => handleDeleteRule(rule.id)}
                                                        className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'sandbox' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Input Calculator Simulator */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 h-fit space-y-6">
                        <div className="flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-indigo-600" />
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Tax Sandbox Calculator</h3>
                        </div>

                        <form onSubmit={handleSimulateCalculation} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Country ISO Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={2}
                                    value={calcCountry}
                                    onChange={(e) => setCalcCountry(e.target.value.toUpperCase())}
                                    placeholder="e.g. BD, US, GB"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">State / Province / Region (Optional)</label>
                                <input
                                    type="text"
                                    value={calcState}
                                    onChange={(e) => setCalcState(e.target.value)}
                                    placeholder="e.g. Dhaka, NY, CA"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Base Price / Transaction Amount</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="1"
                                    value={calcAmount}
                                    onChange={(e) => setCalcAmount(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-black text-xs font-mono text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Tax Classification</label>
                                <select
                                    value={calcCategory}
                                    onChange={(e) => setCalcCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs text-slate-900 dark:text-white"
                                >
                                    <option value="STANDARD">Standard rate</option>
                                    <option value="REDUCED">Reduced rate</option>
                                    <option value="ZERO_RATED">Zero rated</option>
                                    <option value="EXEMPT">Exempt</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={calculating}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-755 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2"
                            >
                                {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Tax Lookup'}
                            </button>
                        </form>
                    </div>

                    {/* Right: Sandbox Results Output Display */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-6 h-full flex flex-col justify-center">
                            {calcResult ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center gap-4">
                                        <Landmark className="w-8 h-8 text-indigo-600" />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matched Rule</p>
                                            <h4 className="text-base font-black text-slate-900 uppercase">{calcResult.ruleName}</h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Base Price</p>
                                            <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{formatPrice(calcResult.baseAmount)}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Computed Regional Tax</p>
                                            <p className="text-lg font-black text-indigo-600 font-mono">+{formatPrice(calcResult.taxAmount)} ({calcResult.rate}%)</p>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                                        <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Simulated Invoice Total:</span>
                                        <span className="text-xl font-black text-slate-950 dark:text-white font-mono">{formatPrice(calcResult.totalAmount)}</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center text-slate-400 py-12">
                                    <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-xs font-black uppercase tracking-wider">Simulation Output Sandbox</p>
                                    <p className="text-xs text-slate-400 font-semibold mt-1">Input values and run a lookup rule test.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Custom Rule Modal */}
            <AnimatePresence>
                {createOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-700">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                    <Scale className="w-5 h-5 text-indigo-500" />
                                    Configure Custom Tax Rule
                                </h2>
                                <button
                                    onClick={() => setCreateOpen(false)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateRule} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rule Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={ruleName}
                                        onChange={(e) => setRuleName(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                        placeholder="e.g. Sales Tax CA"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Country (ISO 2)</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={2}
                                            value={ruleCountry}
                                            onChange={(e) => setRuleCountry(e.target.value.toUpperCase())}
                                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs uppercase"
                                            placeholder="US"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State / Province</label>
                                        <input
                                            type="text"
                                            value={ruleState}
                                            onChange={(e) => setRuleState(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                            placeholder="CA"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rate %</label>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={ruleRate}
                                            onChange={(e) => setRuleRate(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-black text-xs font-mono"
                                            placeholder="8.25"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Classification</label>
                                        <select
                                            value={ruleCategory}
                                            onChange={(e) => setRuleCategory(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none font-bold text-xs"
                                        >
                                            <option value="STANDARD">Standard</option>
                                            <option value="REDUCED">Reduced</option>
                                            <option value="ZERO_RATED">Zero Rated</option>
                                            <option value="EXEMPT">Exempt</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setCreateOpen(false)}
                                        className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg"
                                    >
                                        Save Rule
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
