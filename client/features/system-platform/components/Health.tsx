'use client';

import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Clock,
    Cpu,
    Database,
    HardDrive,
    Network,
    Server,
    ShieldCheck,
    Thermometer,
    Zap,
    TrendingUp,
    Box,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// --- Sub-Components ---

function UsageBar({ percent }: { percent: number }) {
    const color =
        percent >= 90 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-indigo-500';
    return (
        <div className="w-full bg-slate-100 dark:bg-slate-900/50 h-2 rounded-full overflow-hidden mt-3">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percent, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full ${color}`}
            />
        </div>
    );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white truncate mt-0.5">{value}</p>
                {sub && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight opacity-70">{sub}</p>}
            </div>
        </div>
    );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{title}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">{subtitle}</p>
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-xl shadow-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">Telemetry Snapshot</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mt-1.5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{entry.name}</span>
                        </div>
                        <p className="text-xs font-black text-white">
                            {entry.value}%
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// --- Main Page ---

export default function PlatformHealth() {
    const [data, setData] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const result = await fetchSuperAdminAPI('/super-admin/health');
                const ss = result.data?.serverStatus;

                setData(result.data);

                if (ss) {
                    setHistory(prev => {
                        const newSnapshot = {
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            cpu: parseFloat(ss.cpu?.usagePercent || 0),
                            memory: parseFloat(ss.memory?.usagePercent || 0),
                        };
                        return [...prev, newSnapshot].slice(-30);
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
        const interval = setInterval(fetchHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0d 0h 0m';
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    if (loading && !data)
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-600/20 rounded-full" />
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm">Initializing Telemetry Link</p>
                    <p className="text-slate-400 text-xs font-bold animate-pulse">Syncing with system node 01...</p>
                </div>
            </div>
        );

    const ss = data?.serverStatus;
    const cpuUsage = parseFloat(ss?.cpu?.usagePercent ?? 0);
    const memUsage = parseFloat(ss?.memory?.usagePercent ?? 0);

    return (
        <div className="max-w-[1700px] mx-auto space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-100 dark:border-slate-800 pb-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-md border border-rose-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
                            System Restricted
                        </div>
                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
                            Health: Nominal
                        </div>
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">COMMAND CENTER</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Real-time Infrastructure Monitoring & Telemetry</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Active Link: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </header>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Database className="w-7 h-7" />}
                    label="Storage Layer"
                    value={data?.health?.database || 'Connected'}
                    sub="PostgreSQL Engine"
                />
                <StatCard
                    icon={<Clock className="w-7 h-7" />}
                    label="Uptime Matrix"
                    value={formatUptime(ss?.os?.uptimeSeconds || 0)}
                    sub="Continuous Session"
                />
                <StatCard
                    icon={<Zap className="w-7 h-7" />}
                    label="Heat Level"
                    value={ss?.temperature != null ? `${ss.temperature}°C` : 'N/A'}
                    sub="Chassis Thermal"
                />
                <StatCard
                    icon={<ShieldCheck className="w-7 h-7" />}
                    label="Revision"
                    value={`v${data?.health?.version || '1.0.0'}`}
                    sub="Stable Build"
                />
            </div>

            {/* Main Interactive Matrix */}
            <main className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* COLUMN 1: COMPUTE CORE (8/12) */}
                <div className="xl:col-span-8 space-y-10">

                    {/* Performance Engine Module (Graphs) */}
                    <section className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                            <Activity className="w-32 h-32 text-indigo-500 transition-transform duration-700 group-hover:scale-110" />
                        </div>

                        <div className="p-10 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <SectionHeader
                                icon={Activity}
                                title="Performance Oscilloscope"
                                subtitle="Real-time Compute Fluctuation"
                            />
                            <div className="flex gap-8 mb-6 md:mb-0">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">CPU Load</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                                        <span className="text-2xl font-black text-white leading-none">{cpuUsage}%</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">MEM Load</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                                        <span className="text-2xl font-black text-white leading-none">{memUsage}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-[400px] w-full relative z-10 px-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="#475569"
                                        fontSize={9}
                                        fontWeight="bold"
                                        tickLine={false}
                                        axisLine={false}
                                        hide={true}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        stroke="#475569"
                                        fontSize={10}
                                        fontWeight="black"
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(val) => `${val}%`}
                                        width={40}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="cpu"
                                        name="CPU"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorCpu)"
                                        isAnimationActive={false}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="memory"
                                        name="Memory"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorMem)"
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Hardware Snapshot Module (Bars) */}
                    <section className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 p-10 shadow-xl shadow-indigo-500 text-slate-900 dark:text-white relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 pointer-events-none">
                            <Cpu className="w-80 h-80" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                            <SectionHeader icon={Cpu} title="Hardware Core" subtitle="Physical Resource Allocation" />
                            <div className="flex items-center gap-6">
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Threads</p>
                                    <p className="text-xl font-black text-indigo-500 leading-none">{ss?.totalProcesses ?? '0'}</p>
                                </div>
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xl font-black text-emerald-500 leading-none tracking-tighter italic">NOMINAL</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                            {/* CPU Column */}
                            <div className="space-y-8 group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Logic Stream</p>
                                        <p className="text-lg font-black tracking-tight">{ss?.cpu?.brand || 'Processing'}</p>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                            {ss?.cpu?.cores} Logical Cores · {ss?.cpu?.manufacturer}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-5xl font-black text-indigo-600 tracking-tighter leading-none block">
                                            {cpuUsage}<span className="text-xl ml-0.5">%</span>
                                        </span>
                                    </div>
                                </div>
                                <UsageBar percent={cpuUsage} />
                                {ss?.cpu?.loadAverage && (
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">Load Avg</div>
                                        <div className="font-mono text-xs font-black text-indigo-500">{ss.cpu.loadAverage}</div>
                                    </div>
                                )}
                            </div>

                            {/* Memory Column */}
                            <div className="space-y-8 group">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Volatile Cache</p>
                                        <p className="text-lg font-black tracking-tight">Active Addressable</p>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                            {ss?.memory?.used} of {ss?.memory?.total} Total
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-5xl font-black text-indigo-600 tracking-tighter leading-none block">
                                            {memUsage}<span className="text-xl ml-0.5">%</span>
                                        </span>
                                    </div>
                                </div>
                                <UsageBar percent={memUsage} />
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM Type</div>
                                    <div className="font-mono text-xs font-black text-indigo-500">SYSTEM DDR</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* COLUMN 2: ENVIRONMENT & INFRA (4/12) */}
                <div className="xl:col-span-4 space-y-10">

                    {/* Docker Module */}
                    <section className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 p-8 shadow-sm">
                        <SectionHeader icon={Box} title="Runtime Context" subtitle="Containerized Environment" />
                        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                            {ss?.docker?.length > 0 ? (
                                ss.docker.map((container: any) => (
                                    <div key={container.id} className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:border-sky-500/40 group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4 min-w-0">
                                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 group-hover:scale-150 transition-transform ${container.state === 'running' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-900 dark:text-white truncate text-sm uppercase leading-none">{container.name.replace('/', '')}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 truncate mt-1.5 opacity-80">{container.image}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest leading-none ${container.state === 'running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {container.state}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Node Isolated</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Storage & Connectivity Module */}
                    <section className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700/50 p-8 shadow-sm space-y-12">
                        {/* Storage Header */}
                        <div>
                            <SectionHeader icon={HardDrive} title="Persistence" subtitle="Logical Drive Array" />
                            <div className="space-y-6">
                                {ss?.disk?.map((d: any, i: number) => (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-center mb-2.5">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                {d.filesystem}
                                            </span>
                                            <span className="text-xs font-black text-indigo-500">{d.usagePercent}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-900/50 h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${d.usagePercent}%` }}
                                                className={`h-full ${parseFloat(d.usagePercent) >= 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{d.usedGB} GB of {d.sizeGB} GB utilized</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Network Header */}
                        <div>
                            <SectionHeader icon={Network} title="Connectivity" subtitle="I/O Matrix Flow" />
                            <div className="space-y-4">
                                {ss?.network?.map((n: any, i: number) => (
                                    <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-700/50">
                                        <p className="font-mono text-[9px] font-black text-slate-400 mb-4 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 inline-block uppercase tracking-widest">
                                            IFACE: {n.interface}
                                        </p>
                                        <div className="flex justify-between gap-6">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Incoming</p>
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-xl font-black text-emerald-500 tracking-tighter">{(n.rx_bytes / 1024 / 1024).toFixed(2)}</p>
                                                    <span className="text-[9px] font-black text-slate-400">MB</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 text-right">Outgoing</p>
                                                <div className="flex items-baseline gap-1 justify-end">
                                                    <p className="text-xl font-black text-indigo-500 tracking-tighter">{(n.tx_bytes / 1024 / 1024).toFixed(2)}</p>
                                                    <span className="text-[9px] font-black text-slate-400">MB</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Node Firmware (OS) */}
                    <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -left-10 opacity-10 pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
                            <Server className="w-40 h-40" />
                        </div>
                        <SectionHeader icon={Server} title="Node Topology" subtitle="Target System Architecture" />
                        <div className="space-y-1 divide-y divide-white/5 relative z-10">
                            {[
                                { label: 'Active Kernel', value: ss?.os?.platform },
                                { label: 'Software Distro', value: ss?.os?.distro },
                                { label: 'Revision ID', value: ss?.os?.release },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between py-4 items-center group/item hover:bg-white/5 px-2 -mx-2 rounded-xl transition-colors cursor-default">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-sm font-black tracking-tight">{item.value || '--'}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
