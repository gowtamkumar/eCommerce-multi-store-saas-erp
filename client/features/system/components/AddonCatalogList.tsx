'use client';

import { fetchSuperAdminAPI } from '@/services/supperAdminApi';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle2,
    Edit2,
    HardDrive,
    MapPin,
    Package,
    Plus,
    Search,
    ShoppingCart,
    Sparkles,
    Trash2,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AddonCatalogItem {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    boostLabel: string;
    boostValue: number;
    boostUnit: string;
    price: number;
    icon: string;
    features: string[];
    isActive: boolean;
    sortOrder: number;
}

const EMPTY_FORM: Omit<AddonCatalogItem, 'id'> = {
    slug: '',
    name: '',
    description: '',
    category: 'resource',
    boostLabel: '',
    boostValue: 0,
    boostUnit: 'products',
    price: 0,
    icon: 'Package',
    features: [],
    isActive: true,
    sortOrder: 0,
};

// ─── Icon Resolver ───────────────────────────────────────────────────────────

const ICONS: Record<string, React.ComponentType<any>> = {
    HardDrive,
    Package,
    ShoppingCart,
    Users,
    MapPin,
    Zap,
    Sparkles,
};

function AddonIcon({ name, className }: { name: string; className?: string }) {
    const Icon = ICONS[name] ?? Package;
    return <Icon className={className} />;
}

const UNIT_LABELS: Record<string, string> = {
    mb: 'MB Storage',
    products: 'Products',
    orders: 'Orders/Mo',
    staff: 'Staff Accounts',
    locations: 'Locations',
};

// ─── Addon Card ───────────────────────────────────────────────────────────────

function AddonCard({
    addon,
    onToggle,
    onEdit,
    onDelete,
    loadingId,
}: {
    addon: AddonCatalogItem;
    onToggle: (id: string, current: boolean) => void;
    onEdit: (addon: AddonCatalogItem) => void;
    onDelete: (id: string) => void;
    loadingId: string | null;
}) {
    const categoryColor = addon.category === 'storage'
        ? 'from-blue-500/10 to-cyan-500/10 border-blue-100 dark:border-blue-900/40'
        : 'from-violet-500/10 to-purple-500/10 border-violet-100 dark:border-violet-900/40';

    const iconBg = addon.category === 'storage'
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-100 dark:border-blue-900/50'
        : 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 border-violet-100 dark:border-violet-900/50';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`group relative bg-white dark:bg-slate-900 rounded-[2rem] border overflow-hidden transition-all duration-300 hover:shadow-[0_24px_48px_-8px_rgba(0,0,0,0.12)] ${!addon.isActive ? 'border-dashed border-slate-200 dark:border-slate-800 opacity-70' : 'border-slate-100 dark:border-slate-800 shadow-sm'}`}
        >
            {/* Category gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-30 ${categoryColor}`} />

            <div className="relative z-10 p-6">
                {/* Header row */}
                <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-transform group-hover:scale-110 duration-500 ${iconBg}`}>
                        <AddonIcon name={addon.icon} className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Toggle active */}
                        <button
                            onClick={() => onToggle(addon.id, addon.isActive)}
                            disabled={loadingId === addon.id}
                            title={addon.isActive ? 'Deactivate' : 'Activate'}
                            className={`p-2 rounded-xl border transition-all hover:scale-110 active:scale-95 ${addon.isActive
                                ? 'text-emerald-500 bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30'
                                : 'text-slate-400 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'}`}
                        >
                            {loadingId === addon.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                            ) : addon.isActive ? (
                                <CheckCircle2 className="w-4 h-4" />
                            ) : (
                                <XCircle className="w-4 h-4" />
                            )}
                        </button>
                        <div className="w-px h-7 bg-slate-100 dark:bg-slate-800" />
                        <button
                            onClick={() => onEdit(addon)}
                            className="p-2 text-slate-400 hover:text-brand-600 transition-all hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl hover:scale-110"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(addon.id)}
                            disabled={loadingId === addon.id}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl hover:scale-110"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Name + badges */}
                <div className="mb-3">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{addon.name}</h3>
                        {!addon.isActive && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">Inactive</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 h-8">{addon.description}</p>
                </div>

                {/* Boost label */}
                <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mb-4">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{addon.boostLabel}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{UNIT_LABELS[addon.boostUnit] ?? addon.boostUnit}</span>
                        <span className="text-xs font-black text-brand-600 dark:text-brand-400">+{addon.boostValue.toLocaleString()}</span>
                    </div>
                </div>

                {/* Price + slug footer */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            ${addon.price}<span className="text-xs font-bold text-slate-400 ml-1">one-time</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">{addon.slug}</p>
                        <p className="text-[10px] font-bold text-slate-500 capitalize">{addon.category}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────

function AddonFormModal({
    initial,
    onClose,
    onSaved,
}: {
    initial: AddonCatalogItem | null;
    onClose: () => void;
    onSaved: (addon: AddonCatalogItem) => void;
}) {
    const isEdit = !!initial;
    const [form, setForm] = useState<Omit<AddonCatalogItem, 'id'>>(
        initial ? { ...initial } : { ...EMPTY_FORM }
    );
    const [featuresText, setFeaturesText] = useState(
        (initial?.features ?? []).join('\n')
    );
    const [saving, setSaving] = useState(false);

    const set = (key: keyof typeof form, val: any) => setForm((p) => ({ ...p, [key]: val }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                features: featuresText.split('\n').map((f) => f.trim()).filter(Boolean),
                boostValue: Number(form.boostValue),
                price: Number(form.price),
                sortOrder: Number(form.sortOrder),
            };
            let res: any;
            if (isEdit) {
                res = await fetchSuperAdminAPI(`/super-admin/addon-catalog/${initial!.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });
            } else {
                res = await fetchSuperAdminAPI('/super-admin/addon-catalog', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            if (res?.success) {
                toast.success(isEdit ? 'Addon updated!' : 'Addon created!');
                onSaved(res.data);
            } else {
                toast.error(res?.message || 'Failed to save addon');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save addon');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-slate-800"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isEdit ? 'Edit Addon' : 'New Addon'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">Configure the addon details and boost parameters.</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all">
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Name *</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => set('name', e.target.value)}
                                    placeholder="Lite Storage Boost"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Slug *</label>
                                <input
                                    required
                                    value={form.slug}
                                    onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                    placeholder="addon_storage_5gb"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => set('description', e.target.value)}
                                rows={2}
                                placeholder="Short description shown on the billing page..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => set('category', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                >
                                    <option value="storage">Storage</option>
                                    <option value="resource">Resource</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Boost Unit *</label>
                                <select
                                    value={form.boostUnit}
                                    onChange={(e) => set('boostUnit', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                >
                                    <option value="mb">MB (Storage)</option>
                                    <option value="products">Products</option>
                                    <option value="orders">Orders/Mo</option>
                                    <option value="staff">Staff Accounts</option>
                                    <option value="locations">Locations</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Boost Value *</label>
                                <input
                                    required
                                    type="number"
                                    min={1}
                                    value={form.boostValue}
                                    onChange={(e) => set('boostValue', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Boost Label *</label>
                                <input
                                    required
                                    value={form.boostLabel}
                                    onChange={(e) => set('boostLabel', e.target.value)}
                                    placeholder="+5 GB Storage"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Price (USD) *</label>
                                <input
                                    required
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={form.price}
                                    onChange={(e) => set('price', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Sort Order</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={form.sortOrder}
                                    onChange={(e) => set('sortOrder', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">Icon (Lucide name)</label>
                                <select
                                    value={form.icon}
                                    onChange={(e) => set('icon', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                                >
                                    <option value="HardDrive">HardDrive</option>
                                    <option value="Package">Package</option>
                                    <option value="ShoppingCart">ShoppingCart</option>
                                    <option value="Users">Users</option>
                                    <option value="MapPin">MapPin</option>
                                    <option value="Zap">Zap</option>
                                    <option value="Sparkles">Sparkles</option>
                                </select>
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                    <div
                                        onClick={() => set('isActive', !form.isActive)}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${form.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                                Feature Bullets <span className="font-medium normal-case tracking-normal text-slate-400">(one per line)</span>
                            </label>
                            <textarea
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                rows={4}
                                placeholder={`5,120 MB Storage Space\nHigh-speed MinIO hosting\nInstant activation\nCancel anytime`}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none font-mono"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black tracking-wide hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" /> : null}
                                {isEdit ? 'Save Changes' : 'Create Addon'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface AddonCatalogListProps {
    initialAddons: AddonCatalogItem[];
}

export default function AddonCatalogList({ initialAddons }: AddonCatalogListProps) {
    const [addons, setAddons] = useState(initialAddons);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<'all' | 'storage' | 'resource'>('all');
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [editAddon, setEditAddon] = useState<AddonCatalogItem | null>(null);
    const [showCreate, setShowCreate] = useState(false);

    const filtered = addons.filter((a) => {
        const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'all' || a.category === filterCategory;
        return matchSearch && matchCat;
    });

    const handleToggle = async (id: string, current: boolean) => {
        setLoadingId(id);
        try {
            const res = await fetchSuperAdminAPI(`/super-admin/addon-catalog/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: !current }),
            });
            if (res?.success) {
                setAddons((prev) => prev.map((a) => a.id === id ? { ...a, isActive: !current } : a));
                toast.success(!current ? 'Addon activated' : 'Addon deactivated');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this addon? Tenants who have already purchased it will keep their boost.')) return;
        setLoadingId(id);
        try {
            const res = await fetchSuperAdminAPI(`/super-admin/addon-catalog/${id}`, { method: 'DELETE' });
            if (res?.success) {
                setAddons((prev) => prev.filter((a) => a.id !== id));
                toast.success('Addon deleted');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        } finally {
            setLoadingId(null);
        }
    };

    const handleSaved = (saved: AddonCatalogItem) => {
        if (editAddon) {
            setAddons((prev) => prev.map((a) => a.id === saved.id ? saved : a));
            setEditAddon(null);
        } else {
            setAddons((prev) => [...prev, saved]);
            setShowCreate(false);
        }
    };

    const activeCount = addons.filter((a) => a.isActive).length;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Addon Catalog</h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Define purchasable add-ons for tenants.&nbsp;
                            <span className="font-bold text-slate-700 dark:text-slate-300">{activeCount} active</span> of {addons.length} total.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* Search */}
                        <div className="relative flex-1 sm:w-64 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search addons..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-bold"
                            />
                        </div>

                        {/* Category filter */}
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                            {(['all', 'storage', 'resource'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCategory === cat
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                >
                                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Add button */}
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all text-sm font-black uppercase tracking-widest shadow-xl active:scale-[0.98] whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" strokeWidth={3} />
                            New Addon
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Addons', value: addons.length, color: 'text-slate-900 dark:text-white' },
                    { label: 'Active', value: addons.filter(a => a.isActive).length, color: 'text-emerald-600' },
                    { label: 'Storage Type', value: addons.filter(a => a.category === 'storage').length, color: 'text-blue-600' },
                    { label: 'Resource Type', value: addons.filter(a => a.category === 'resource').length, color: 'text-violet-600' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className={`text-3xl font-black ${color}`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filtered.map((addon) => (
                        <AddonCard
                            key={addon.id}
                            addon={addon}
                            onToggle={handleToggle}
                            onEdit={setEditAddon}
                            onDelete={handleDelete}
                            loadingId={loadingId}
                        />
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Package className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No addons found</h3>
                            <p className="text-slate-400 font-medium text-sm">
                                {searchTerm ? 'Try a different search term.' : 'Click "New Addon" to add your first addon.'}
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(showCreate || editAddon) && (
                    <AddonFormModal
                        initial={editAddon}
                        onClose={() => { setShowCreate(false); setEditAddon(null); }}
                        onSaved={handleSaved}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
