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
import { 
    Edit2, 
    MapPin, 
    Plus, 
    Trash2, 
    Check, 
    Loader2, 
    MoreVertical,
    Home,
    Briefcase,
    Building2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const data = await getShippingAddresses();
            setAddresses(data);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (address?: ShippingAddress) => {
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
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingId) {
                await updateShippingAddress(editingId, formData);
                toast.success('Address updated successfully');
            } else {
                await createShippingAddress(formData);
                toast.success('Address added successfully');
            }
            fetchAddresses();
            handleCloseForm();
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await deleteShippingAddress(id);
            toast.success('Address deleted successfully');
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultShippingAddress(id);
            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            toast.error('Failed to update default address');
        }
    };

    const getLabelIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home': return <Home className="w-4 h-4" />;
            case 'office': return <Briefcase className="w-4 h-4" />;
            default: return <Building2 className="w-4 h-4" />;
        }
    };

    if (loading && addresses.length === 0) {
        return (
            <div className="p-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Shipping Addresses</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your delivery locations</p>
                </div>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-brand-500/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add New Address</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {isFormOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-8 mb-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Address Label</label>
                                    <div className="flex gap-2">
                                        {['Home', 'Office', 'Other'].map((label) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, label })}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.label === label
                                                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Recipient Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.recipientName}
                                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                        placeholder="Full name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                        placeholder="017XXXXXXXX"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                        placeholder="Town / City"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Delivery Zone</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[ShippingZoneType.INSIDE, ShippingZoneType.OUTSIDE].map((zone) => (
                                            <button
                                                key={zone}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, zone })}
                                                className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${formData.zone === zone
                                                    ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500'
                                                }`}
                                            >
                                                {zone === ShippingZoneType.INSIDE ? 'Inside City' : 'Outside City'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Street Address</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none"
                                    placeholder="House #, Road #, Area, etc."
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${formData.isDefault ? 'bg-brand-600 border-brand-600' : 'border-slate-200 dark:border-slate-700'}`}>
                                    {formData.isDefault && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Set as default address</span>
                            </label>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-xl"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? 'Update Address' : 'Save Address'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {addresses.length === 0 ? (
                            <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-8 h-8 text-slate-400" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">No saved addresses</h4>
                                <p className="text-slate-500 text-sm mt-1">Add your shipping addresses for a faster checkout</p>
                            </div>
                        ) : (
                            addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={`relative p-6 rounded-3xl border-2 transition-all group ${address.isDefault
                                        ? 'border-brand-600/50 bg-brand-50/30 dark:bg-brand-900/10'
                                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                            <span className="text-brand-600 dark:text-brand-400">
                                                {getLabelIcon(address.label || 'Home')}
                                            </span>
                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                                {address.label || 'Home'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleOpenForm(address)}
                                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(address.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1 mb-4">
                                        <h4 className="font-bold text-slate-900 dark:text-white">{address.recipientName}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {address.address}, {address.city}
                                        </p>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-500">
                                            {address.phone}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {address.zone === ShippingZoneType.INSIDE ? 'Inside City' : 'Outside City'}
                                        </span>
                                        {address.isDefault ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                                <Check className="w-3 h-3" /> Default
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline"
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
