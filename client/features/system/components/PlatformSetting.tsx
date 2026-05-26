'use client'
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';
import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { Globe, Layout, Plus, Save, Shield, Trash2, Zap, Database, AlertTriangle, Loader2, X, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSetting() {
    const [settings, setSettings] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Cache clearing states for Super Admin
    const [clearing, setClearing] = useState(false);
    const [clearingAll, setClearingAll] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState('');
    const [tenantsList, setTenantsList] = useState<any[]>([]);
    const [showGlobalConfirm, setShowGlobalConfirm] = useState(false);
    const [showTenantConfirm, setShowTenantConfirm] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetchAPI('/platform/settings');
                setSettings(res.data);
            } catch (error) {
                console.error('Failed to load settings:', error);
                toast.error('Failed to load platform settings');
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);

    useEffect(() => {
        if (activeTab === 'system') {
            async function loadTenants() {
                try {
                    const res = await fetchSuperAdminAPI('/super-admin/tenants');
                    setTenantsList(res.data || []);
                } catch (error) {
                    console.error('Failed to load tenants:', error);
                    toast.error('Failed to load tenants list');
                }
            }
            loadTenants();
        }
    }, [activeTab]);

    const handleClearGlobalCache = async () => {
        setClearingAll(true);
        try {
            await fetchSuperAdminAPI("/super-admin/cache/clear-all", {
                method: "POST",
            });
            toast.success("Global system cache cleared successfully!");
            setShowGlobalConfirm(false);
        } catch (error: any) {
            console.error("Failed to clear global cache", error);
            toast.error(error.message || "Failed to clear global cache");
        } finally {
            setClearingAll(false);
        }
    };

    const handleClearTenantCache = async () => {
        if (!selectedTenantId) return;

        const tenant = tenantsList.find(t => t.id === selectedTenantId);
        const tenantName = tenant ? `${tenant.name} (${tenant.subdomain})` : 'selected tenant';

        setClearing(true);
        try {
            await fetchSuperAdminAPI(`/super-admin/cache/clear-all?tenantId=${selectedTenantId}`, {
                method: "POST",
            });
            toast.success(`Cache for ${tenantName} cleared successfully!`);
            setShowTenantConfirm(false);
        } catch (error: any) {
            console.error("Failed to clear tenant cache", error);
            toast.error(error.message || "Failed to clear tenant cache");
        } finally {
            setClearing(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchAPI('/platform/settings', {
                method: 'PUT',
                body: JSON.stringify(settings),
            });
            toast.success('Global settings updated successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to update platform settings');
        } finally {
            setSaving(false);
        }
    };


    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Configure global behavior and guest landing page content.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-70"
                >
                    {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                    Save Changes
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'identity', label: 'Identity', icon: Globe },
                    { id: 'hero', label: 'Hero Section', icon: Layout },
                    { id: 'features', label: 'Features', icon: Zap },
                    { id: 'footer', label: 'Footer', icon: Shield },
                    { id: 'system', label: 'System & Cache', icon: Database },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

             <div className="max-w-5xl space-y-6">
                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        {/* Grid of status cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card 1: Platform Status */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Platform Status</h4>
                                    <span className={`w-3 h-3 rounded-full ${settings.isMaintenanceMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                                        {settings.isMaintenanceMode ? 'Maintenance Mode' : 'Operational / Live'}
                                    </p>
                                    <p className="text-xs text-slate-505 dark:text-slate-405">
                                        {settings.isMaintenanceMode ? 'External traffic is blocked.' : 'All services are fully active.'}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Quick Toggle</span>
                                    <button
                                        type="button"
                                        onClick={() => setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode })}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                                            settings.isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                settings.isMaintenanceMode ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Card 2: Branding Overview */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Identity Details</h4>
                                    <Globe className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="flex items-center gap-4">
                                    {settings.brandLogo ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={settings.brandLogo} alt="Logo" className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 font-black text-lg">
                                            {settings.brandName?.charAt(0) || 'L'}
                                        </div>
                                    )}
                                    <div className="overflow-hidden">
                                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">{settings.brandName}</p>
                                        <p className="text-xs text-slate-500 truncate">{settings.supportEmail}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                                    <span className="text-slate-505 dark:text-slate-405">Navigation links</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{(settings.navbar?.links || []).length} active</span>
                                </div>
                            </div>

                            {/* Card 3: System Overview */}
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Marketing & Content</h4>
                                    <Zap className="w-4 h-4 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                                        {(settings.features || []).length} Features
                                    </p>
                                    <p className="text-xs text-slate-505 dark:text-slate-405 truncate">
                                        Hero badge: {settings.hero?.badge || 'None'}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
                                    <span className="text-slate-550 dark:text-slate-450">Trust badges active</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{(settings.hero?.trustBadges || []).length} items</span>
                                </div>
                            </div>
                        </div>

                        {/* Middle detailed view */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Maintenance Details */}
                            {settings.isMaintenanceMode && (
                                <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-4 animate-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-center gap-2 text-amber-500">
                                        <AlertTriangle className="w-5 h-5" />
                                        <h5 className="font-black text-sm uppercase tracking-wider">Maintenance Message</h5>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-205 leading-relaxed italic bg-white dark:bg-slate-950/50 p-4 rounded-2xl border border-amber-500/10">
                                        "{settings.maintenanceMessage || 'Platform is currently undergoing scheduled upgrades. Please try again shortly.'}"
                                    </p>
                                </div>
                            )}

                            {/* Quick Cache Clearing Control */}
                            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    <h5 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                        <Database className="w-4 h-4 text-indigo-500" />
                                        Performance Engine Quick Action
                                    </h5>
                                    <p className="text-xs text-slate-500">
                                        Evict temporary storage caches dynamically across the network partitions.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowGlobalConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/20 text-rose-600 border border-rose-100 dark:border-rose-900/10 transition-all font-bold text-xs rounded-2xl"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Evict Global Cache</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Identity Tab */}
                {activeTab === 'identity' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Brand Name</label>
                                    <input
                                        type="text"
                                        value={settings.brandName || ''}
                                        onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="e.g. LuxeAudio"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Support Email</label>
                                    <input
                                        type="email"
                                        value={settings.supportEmail || ''}
                                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        placeholder="support@example.com"
                                    />
                                </div>
                            </div>

                            <ImageUploadField
                                label="Brand Logo"
                                value={settings.brandLogo}
                                onChange={(val) => setSettings({ ...settings, brandLogo: val })}
                                uploadApi={fetchSuperAdminAPI}
                                loadingMsg="Uploading logo..."
                                successMsg="Logo uploaded successfully"
                                errorMsg="Error uploading logo"
                                description="SVG, PNG, JPG (MAX. 2MB)"
                                aspectRatio="square"
                            />
                        </div>
                    </div>
                )}

                {/* Hero Tab */}
                {activeTab === 'hero' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Badge Text</label>
                                <input
                                    type="text"
                                    value={settings.hero?.badge || ''}
                                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, badge: e.target.value } })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Main Headline</label>
                                <input
                                    type="text"
                                    value={settings.hero?.title || ''}
                                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, title: e.target.value } })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={settings.hero?.description || ''}
                                    onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, description: e.target.value } })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary Button Text</label>
                                    <input
                                        type="text"
                                        value={settings.hero?.primaryBtnText || ''}
                                        onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, primaryBtnText: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Primary Button Link</label>
                                    <input
                                        type="text"
                                        value={settings.hero?.primaryBtnLink || ''}
                                        onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, primaryBtnLink: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secondary Button Text</label>
                                    <input
                                        type="text"
                                        value={settings.hero?.secondaryBtnText || ''}
                                        onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, secondaryBtnText: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Secondary Button Link</label>
                                    <input
                                        type="text"
                                        value={settings.hero?.secondaryBtnLink || ''}
                                        onChange={(e) => setSettings({ ...settings, hero: { ...settings.hero, secondaryBtnLink: e.target.value } })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hero Visuals</h3>
                                <ImageUploadField
                                    label="Hero Image"
                                    value={settings.hero?.image}
                                    onChange={(val) => setSettings({ ...settings, hero: { ...settings.hero, image: val } })}
                                    uploadApi={fetchSuperAdminAPI}
                                    loadingMsg="Uploading hero image..."
                                    successMsg="Hero image uploaded successfully"
                                    errorMsg="Error uploading hero image"
                                    description="Recommended size: 1200x800px"
                                    aspectRatio="wide"
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Trust Badges</h3>
                                <div className="space-y-3">
                                    {(settings.hero?.trustBadges || ['No credit card required', '14-day free trial', 'Instant setup']).map((badge: string, idx: number) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={badge}
                                                onChange={(e) => {
                                                    const newBadges = [...(settings.hero?.trustBadges || ['No credit card required', '14-day free trial', 'Instant setup'])];
                                                    newBadges[idx] = e.target.value;
                                                    setSettings({ ...settings, hero: { ...settings.hero, trustBadges: newBadges } });
                                                }}
                                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newBadges = (settings.hero?.trustBadges || ['No credit card required', '14-day free trial', 'Instant setup']).filter((_: any, i: number) => i !== idx);
                                                    setSettings({ ...settings, hero: { ...settings.hero, trustBadges: newBadges } });
                                                }}
                                                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newBadges = [...(settings.hero?.trustBadges || ['No credit card required', '14-day free trial', 'Instant setup']), 'New Badge'];
                                            setSettings({ ...settings, hero: { ...settings.hero, trustBadges: newBadges } });
                                        }}
                                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add Badge
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Features Tab */}
                {activeTab === 'features' && (
                    <div className="space-y-4">
                        {(settings.features || []).map((feature: any, idx: number) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex gap-6 items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Icon Name (e.g. Zap, Globe)"
                                            value={feature.icon}
                                            onChange={(e) => {
                                                const newFeatures = [...settings.features];
                                                newFeatures[idx].icon = e.target.value;
                                                setSettings({ ...settings, features: newFeatures });
                                            }}
                                            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Feature Title"
                                            value={feature.title}
                                            onChange={(e) => {
                                                const newFeatures = [...settings.features];
                                                newFeatures[idx].title = e.target.value;
                                                setSettings({ ...settings, features: newFeatures });
                                            }}
                                            className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Description"
                                        value={feature.description}
                                        onChange={(e) => {
                                            const newFeatures = [...settings.features];
                                            newFeatures[idx].description = e.target.value;
                                            setSettings({ ...settings, features: newFeatures });
                                        }}
                                        className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 h-20"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const newFeatures = settings.features.filter((_: any, i: number) => i !== idx);
                                        setSettings({ ...settings, features: newFeatures });
                                    }}
                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const newFeatures = [...(settings.features || []), { icon: 'Zap', title: 'New Feature', description: '' }];
                                setSettings({ ...settings, features: newFeatures });
                            }}
                            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-500 hover:text-indigo-600 hover:border-indigo-600 transition-all flex items-center justify-center gap-2 font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            Add Feature
                        </button>
                    </div>
                )}

                {/* Footer Tab */}
                {activeTab === 'footer' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Footer Description</label>
                                <textarea
                                    value={settings.footer?.description || ''}
                                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, description: e.target.value } })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Copyright Text</label>
                                <input
                                    type="text"
                                    value={settings.footer?.copyright || ''}
                                    onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyright: e.target.value } })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* System & Cache Tab */}
                {activeTab === 'system' && (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in duration-300">
                        <div className="p-8 space-y-6">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 font-display">
                                    <Database className="w-5 h-5 text-indigo-600" />
                                    Redis Cache Management
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Clearing the cache evicts temporary entries stored in Redis. You can clear the entire global system cache or specify a single tenant store.
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                                    <AlertTriangle className="w-5 h-5 text-indigo-600" />
                                    Platform System Controls
                                </h4>
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Mode</h5>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Freeze client access across all store partitions except for Super Admins.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                                                settings.isMaintenanceMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    settings.isMaintenanceMode ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    
                                    {settings.isMaintenanceMode && (
                                        <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
                                            <label className="block text-xs font-semibold text-slate-750 dark:text-slate-350">Alert Message</label>
                                            <textarea
                                                value={settings.maintenanceMessage || ''}
                                                onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20"
                                                placeholder="Platform is currently undergoing scheduled upgrades. Please try again shortly."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                {/* Clear Global Cache Card */}
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                    <div>
                                        <h5 className="text-base font-bold text-slate-900 dark:text-white mb-2">Global System Cache</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                                            Clears all cached data across all tenants (categories, products, settings, plans).
                                            This should be done during system updates or global changes.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowGlobalConfirm(true)}
                                        disabled={clearingAll}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-rose-600 border border-rose-100 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold rounded-xl transition-all disabled:opacity-50"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span>Clear Global Cache</span>
                                    </button>
                                </div>

                                {/* Clear Tenant Cache Card */}
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                    <div>
                                        <h5 className="text-base font-bold text-slate-900 dark:text-white mb-2">Tenant Store Cache</h5>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                            Clears only the cached files, static content, and permission manifests for the selected tenant's store.
                                        </p>
                                        <div className="mb-6">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Select Tenant</label>
                                            <select
                                                value={selectedTenantId}
                                                onChange={(e) => setSelectedTenantId(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                                            >
                                                <option value="">-- Choose a Store / Tenant --</option>
                                                {tenantsList.map((tenant: any) => (
                                                    <option key={tenant.id} value={tenant.id}>
                                                        {tenant.name} ({tenant.subdomain || 'no-subdomain'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowTenantConfirm(true)}
                                        disabled={clearing || !selectedTenantId}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 font-bold rounded-xl transition-all disabled:opacity-40"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        <span>Clear Tenant Cache</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Cache Confirmation Modal */}
            <AnimatePresence>
                {showGlobalConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !clearingAll && setShowGlobalConfirm(false)}
                            className="absolute inset-0 bg-slate-955/40 dark:bg-slate-955/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 space-y-6"
                        >
                            <button
                                type="button"
                                disabled={clearingAll}
                                onClick={() => setShowGlobalConfirm(false)}
                                className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                    Clear Global Cache?
                                </h4>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Are you sure you want to clear the entire system cache across ALL tenants? Performance may temporarily degrade globally.
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={clearingAll}
                                    onClick={() => setShowGlobalConfirm(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={clearingAll}
                                    onClick={handleClearGlobalCache}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-2xl shadow-lg shadow-rose-600/20 hover:shadow-rose-700/30 transition-all disabled:opacity-50"
                                >
                                    {clearingAll ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Clearing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span>Clear Global Cache</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Tenant Cache Confirmation Modal */}
            <AnimatePresence>
                {showTenantConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !clearing && setShowTenantConfirm(false)}
                            className="absolute inset-0 bg-slate-955/40 dark:bg-slate-955/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 space-y-6"
                        >
                            <button
                                type="button"
                                disabled={clearing}
                                onClick={() => setShowTenantConfirm(false)}
                                className="absolute right-4 top-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                                    Clear Store Cache?
                                </h4>
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Are you sure you want to clear the store cache for the selected tenant? Performance may be temporarily affected while the store's cache is rebuilt.
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={clearing}
                                    onClick={() => setShowTenantConfirm(false)}
                                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-2xl transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={clearing}
                                    onClick={handleClearTenantCache}
                                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-700/30 transition-all disabled:opacity-50"
                                >
                                    {clearing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Clearing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span>Clear Tenant Cache</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
