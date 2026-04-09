'use client';

import { ShippingZoneType } from '@/lib/enums/shipping-zone-type.enum';
import {
    createShippingAddress,
    deleteShippingAddress,
    getShippingAddresses,
    setDefaultShippingAddress,
    updateShippingAddress,
    type ShippingAddress
} from '@/services/shippingAddress';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Briefcase,
    Building2,
    Check,
    Edit2,
    Globe,
    Home,
    Loader2,
    MapPin,
    Phone,
    Plus,
    Save,
    Trash2,
    User,
    X
} from 'lucide-react';
import React, { memo, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const AddressItem = memo(({
    address,
    onEdit,
    onDelete,
    onSetDefault,
    getLabelIcon,
    ShippingZoneType
}: {
    address: ShippingAddress,
    onEdit: (a: ShippingAddress) => void,
    onDelete: (id: string) => void,
    onSetDefault: (id: string) => void,
    getLabelIcon: (l: string) => React.ReactNode,
    ShippingZoneType: any
}) => (
    <div
        className={`relative p-8 rounded-[2.5rem] border-2 transition-all group overflow-hidden ${address.isDefault
            ? 'border-brand-600/30 bg-brand-50/20 dark:bg-brand-950/20 shadow-xl shadow-brand-500/5'
            : 'border-slate-50 dark:border-slate-900 bg-white dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-800'
            }`}
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-brand-500/10 transition-colors" />

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <span className="text-brand-600 dark:text-brand-400">
                    {getLabelIcon(address.label || 'Home')}
                </span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                    {address.label || 'Home'}
                </span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(address)}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-xl transition-all active:scale-90"
                    title="Edit"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(address.id)}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-90"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="space-y-3 mb-8 relative z-10">
            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{address.recipientName}</h4>
            <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {address.address}, {address.city}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-300 shrink-0" />
                <p className="text-sm font-black text-slate-600 dark:text-slate-300 font-mono tracking-tighter">
                    {address.phone}
                </p>
            </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800/80 relative z-10 font-black">
            <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Globe className="w-3 h-3" />
                {address.zone === ShippingZoneType.INSIDE ? 'Primary' : 'External'} Terminal
            </span>
            {address.isDefault ? (
                <span className="flex items-center gap-2 text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] bg-brand-500/10 dark:bg-brand-400/10 px-3 py-1.5 rounded-xl">
                    <Check className="w-3.5 h-3.5" /> Identity Root
                </span>
            ) : (
                <button
                    onClick={() => onSetDefault(address.id)}
                    className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:text-brand-600 transition-colors"
                >
                    Set as Root
                </button>
            )}
        </div>
    </div>
));

AddressItem.displayName = 'AddressItem';

export default function ShippingAddresses() {
    const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        label: 'Home',
        recipientName: '',
        phone: '',
        address: '',
        city: '',
        zone: ShippingZoneType.INSIDE,
        isDefault: false
    });

    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getShippingAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('System error: could not fetch locations');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const handleOpenForm = useCallback((address?: ShippingAddress) => {
        if (address) {
            setEditingId(address.id);
            setFormData({
                label: address.label || 'Home',
                recipientName: address.recipientName,
                phone: address.phone,
                address: address.address,
                city: address.city || '',
                zone: address.zone || ShippingZoneType.INSIDE,
                isDefault: address.isDefault
            });
        } else {
            setEditingId(null);
            setFormData({
                label: 'Home',
                recipientName: '',
                phone: '',
                address: '',
                city: '',
                zone: ShippingZoneType.INSIDE,
                isDefault: addresses.length === 0
            });
        }
        setIsFormOpen(true);
    }, [addresses.length]);

    const handleCloseForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingId(null);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateShippingAddress(editingId, formData);
                toast.success('Location updated');
            } else {
                await createShippingAddress(formData);
                toast.success('New location mapped');
            }
            fetchAddresses();
            handleCloseForm();
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Identity transmission failure');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = useCallback(async (id: string) => {
        if (!confirm('Discard this location mapping?')) return;
        try {
            await deleteShippingAddress(id);
            toast.success('Location removed');
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Removal protocol failed');
        }
    }, [fetchAddresses]);

    const handleSetDefault = useCallback(async (id: string) => {
        try {
            await setDefaultShippingAddress(id);
            toast.success('Primary root set');
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Configuration update failed');
        }
    }, [fetchAddresses]);

    const getLabelIcon = useCallback((label: string) => {
        switch (label.toLowerCase()) {
            case 'home': return <Home className="w-5 h-5" />;
            case 'office': return <Briefcase className="w-5 h-5" />;
            default: return <Building2 className="w-5 h-5" />;
        }
    }, []);

    if (loading && addresses.length === 0) {
        return (
            <div className="p-20 flex justify-center items-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Delivery Map</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">Manage your terminal and logistic endpoints</p>
                </div>
                {!isFormOpen && (
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-3 px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-brand-500/25 active:scale-95"
                    >
                        <Plus className="w-6 h-6" />
                        Initialize New Terminal
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isFormOpen ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl relative"
                    >
                        <button
                            onClick={handleCloseForm}
                            className="absolute top-8 right-8 p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Classification</label>
                                    <div className="flex gap-3">
                                        {['Home', 'Office', 'Other'].map((label) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, label })}
                                                className={`flex-1 py-4 px-2 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest transition-all ${formData.label === label
                                                    ? 'border-brand-600 bg-brand-600 text-white ring-4 ring-brand-500/10'
                                                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-400 hover:border-slate-200'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Contact Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.recipientName}
                                            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                            className="w-full pl-14 pr-5 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-400"
                                            placeholder="System Operator Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Vector (Phone)</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-14 pr-5 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-400"
                                            placeholder="+1 000 000 0000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City Hub</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full pl-14 pr-5 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-400"
                                            placeholder="Central Node"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistic Zone Mapping</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[ShippingZoneType.INSIDE, ShippingZoneType.OUTSIDE].map((zone) => (
                                            <button
                                                key={zone}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, zone })}
                                                className={`py-4 px-4 rounded-2xl border-2 font-black text-[11px] uppercase tracking-widest transition-all ${formData.zone === zone
                                                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                                                    : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-400'
                                                    }`}
                                            >
                                                {zone === ShippingZoneType.INSIDE ? 'Internal Sector' : 'External Sector'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Terminal Coordinates (Street Address)</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-8 py-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none font-bold placeholder:text-slate-400"
                                    placeholder="Sector, Block, Gate, Floor Access..."
                                />
                            </div>

                            <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800/80">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${formData.isDefault ? 'bg-brand-600 border-brand-600 shadow-lg shadow-brand-500/30' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'}`}>
                                        {formData.isDefault && <Check className="w-5 h-5 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={formData.isDefault}
                                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    />
                                    <div>
                                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Assign as Root Terminal</span>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary mapping for all future logistics</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-6">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-2xl"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> {editingId ? 'Update Mapping' : 'Synchronize Terminal'}</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-[2rem] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-black"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-10"
                    >
                        {addresses.length === 0 ? (
                            <div className="col-span-full py-24 text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                                <MapPin className="w-20 h-20 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Terminals Mapped</h4>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 px-10">You haven't established any delivery endpoints yet. Initialize your first mapping for streamlined logistics.</p>
                                <button
                                    onClick={() => handleOpenForm()}
                                    className="mt-8 px-8 py-4 bg-white dark:bg-slate-900 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border-2 border-brand-600/20 hover:bg-brand-50 transition-all shadow-lg shadow-brand-500/5 group"
                                >
                                    Launch First Terminal Mapping →
                                </button>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <AddressItem
                                    key={address.id}
                                    address={address}
                                    onEdit={handleOpenForm}
                                    onDelete={handleDelete}
                                    onSetDefault={handleSetDefault}
                                    getLabelIcon={getLabelIcon}
                                    ShippingZoneType={ShippingZoneType}
                                />
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
