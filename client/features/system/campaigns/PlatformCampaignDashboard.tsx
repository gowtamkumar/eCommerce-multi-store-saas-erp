'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Megaphone, Plus, Search, RefreshCcw } from 'lucide-react';
import PlatformCampaignDetails from './PlatformCampaignDetails';
import PlatformCampaignForm from './PlatformCampaignForm';
import PlatformCampaignList from './PlatformCampaignList';
import { usePlatformCampaignManager } from './hooks/usePlatformCampaignManager';

export default function PlatformCampaignDashboard() {
    const {
        campaigns,
        filteredCampaigns,
        stats,
        loading,
        searchQuery,
        isFormOpen,
        editingCampaign,
        viewingCampaign,
        setSearchQuery,
        loadCampaigns,
        openCreate,
        openEdit,
        closeForm,
        handleFormSuccess,
        openView,
        closeView,
        handleSchedule,
        handleCancel,
        handleDelete,
    } = usePlatformCampaignManager();

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-indigo-650" />
                        Platform Campaigns
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Design, schedule and track platform-wide announcements and subscriber emails</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openCreate}
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-500/20 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    New Platform Campaign
                </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search and Refresh */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search campaigns by name..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadCampaigns}
                        className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="min-h-[400px]">
                {loading && campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing your campaigns...</p>
                    </div>
                ) : filteredCampaigns.length > 0 ? (
                    <PlatformCampaignList
                        campaigns={filteredCampaigns}
                        onEdit={openEdit}
                        onSchedule={handleSchedule}
                        onCancel={handleCancel}
                        onDelete={handleDelete}
                        onView={openView}
                    />
                ) : (
                    <div className="bg-white dark:bg-slate-800/50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-12">
                            <Megaphone className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Campaigns Found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-2 mb-8 font-medium">Start drafting Announcements or Platform newsletters today.</p>
                        <button
                            onClick={openCreate}
                            className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs cursor-pointer"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isFormOpen && (
                    <PlatformCampaignForm
                        campaign={editingCampaign}
                        onClose={closeForm}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {viewingCampaign && (
                    <PlatformCampaignDetails
                        campaign={viewingCampaign}
                        onClose={closeView}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
