'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, Filter, RefreshCcw } from 'lucide-react';
import { Campaign } from '../types';
import { fetchCampaigns, scheduleCampaign, cancelCampaignSchedule, deleteCampaign } from '@/services/campaign';
import CampaignList from './CampaignList';
import CampaignForm from './CampaignForm';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CampaignDashboard() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

    const loadCampaigns = async () => {
        setLoading(true);
        try {
            const res = await fetchCampaigns();
            if (res.success) {
                setCampaigns(res.data || []);
            }
        } catch (error) {
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    const handleCreate = () => {
        setEditingCampaign(null);
        setIsFormOpen(true);
    };

    const handleEdit = (campaign: Campaign) => {
        setEditingCampaign(campaign);
        setIsFormOpen(true);
    };

    const handleSchedule = async (campaign: Campaign) => {
        if (!campaign.scheduleTime) {
            toast.error('Please set a schedule time first by editing the campaign');
            return;
        }
        try {
            const res = await scheduleCampaign(campaign.id, campaign.scheduleTime);
            if (res.success) {
                toast.success('Campaign scheduled successfully');
                loadCampaigns();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to schedule');
        }
    };

    const handleCancel = async (campaign: Campaign) => {
        try {
            const res = await cancelCampaignSchedule(campaign.id);
            if (res.success) {
                toast.success('Schedule canceled');
                loadCampaigns();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await deleteCampaign(id);
            if (res.success) {
                toast.success('Campaign deleted');
                loadCampaigns();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete');
        }
    };

    const filteredCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase flex items-center gap-4">
                        <Megaphone className="w-10 h-10 text-brand-600" />
                        Marketing Campaigns
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Design, schedule and track your customer engagement</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-brand-500/20"
                >
                    <Plus className="w-5 h-5" />
                    New Campaign
                </motion.button>
            </div>

            {/* Stats Overview (Quick Glance) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Campaigns', value: campaigns.length, color: 'brand' },
                    { label: 'Active/Running', value: campaigns.filter(c => c.status === 'running').length, color: 'amber' },
                    { label: 'Total Sent', value: campaigns.reduce((acc, c) => acc + c.sentCount, 0), color: 'emerald' },
                    { label: 'Total Failed', value: campaigns.reduce((acc, c) => acc + c.failedCount, 0), color: 'rose' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black text-slate-900 dark:text-white`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-none focus:ring-2 focus:ring-brand-500/20 text-sm font-medium outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={loadCampaigns} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-500 hover:text-brand-500 transition-colors">
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-500 text-sm font-bold uppercase tracking-widest">
                        <Filter className="w-4 h-4" />
                        Status
                    </button>
                </div>
            </div>

            {/* Campaign List */}
            <div className="min-h-[400px]">
                {loading && campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing your campaigns...</p>
                    </div>
                ) : filteredCampaigns.length > 0 ? (
                    <CampaignList 
                        campaigns={filteredCampaigns}
                        onEdit={handleEdit}
                        onSchedule={handleSchedule}
                        onCancel={handleCancel}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="bg-white dark:bg-slate-800/50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                            <Megaphone className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Campaigns Found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8">Start growing your store today by creating your first marketing campaign.</p>
                        <button 
                            onClick={handleCreate}
                            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <CampaignForm 
                        campaign={editingCampaign}
                        onClose={() => setIsFormOpen(false)}
                        onSuccess={() => {
                            setIsFormOpen(false);
                            loadCampaigns();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
