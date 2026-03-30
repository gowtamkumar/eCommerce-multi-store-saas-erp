'use client'
import ImageUploadField from '@/components/shared/ImageUploadField';
import { fetchAPI } from '@/services/api';
import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { Globe, Layout, Plus, Save, Shield, Trash2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function GlobalSetting() {
    const [settings, setSettings] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('identity');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchAPI('/platform/settings', {
                method: 'PATCH',
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
                    { id: 'identity', label: 'Identity', icon: Globe },
                    { id: 'hero', label: 'Hero Section', icon: Layout },
                    { id: 'features', label: 'Features', icon: Zap },
                    { id: 'footer', label: 'Footer', icon: Shield },
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
            </div>
        </div>
    );
}
