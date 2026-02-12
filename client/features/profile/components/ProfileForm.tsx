'use client';

import ImageModal from '@/components/shared/ImageModal';
import { fetchAPI } from '@/services/api';
import { Camera, Loader2, Lock, Save, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfileForm({ variant }: { variant?: 'personal' | 'security' }) {
    const { data: session, status, update } = useSession();

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        image: '',
    });


    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const fetchProfile = async () => {
        try {
            const res = await fetchAPI('/profile');
            if (res.data) {
                setFormData({
                    name: res.data.name || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                    address: res.data.address || '',
                    image: res.data.image || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await fetchAPI('/profile', {
                method: 'PATCH',
                body: JSON.stringify(formData),
            });

            if (data.success) {
                await update(data.user); // Update session
                toast.success('Profile updated successfully');
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            toast.error('Error updating profile');

        } finally {
            setLoading(false);
        }
    };



    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        setImageUploading(true);
        try {
            const data = await fetchAPI('/admin/media', {
                method: 'POST',
                body: formData,
            });

            if (data.success && data.data?.filename) {
                const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3900';
                const imageUrl = `${backendUrl}/uploads/${data.data.filename}`;
                setFormData(prev => ({ ...prev, image: imageUrl }));
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Error uploading image');
        } finally {
            setImageUploading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            const data = await fetchAPI(`/users/update-password/${(session?.user as any).id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (data.success) {
                toast.success('Password changed successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Failed to change password');
            }
        } catch (error) {
            toast.error('Error changing password');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (variant === 'security') {
        return (
            <div className="p-8">
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-xl">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Current Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-xl shadow-slate-900/10 dark:shadow-none"
                    >
                        {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Change Password'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="p-8">
            <form onSubmit={handleProfileUpdate} className="space-y-8">
                {/* Profile Header within Form */}
                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-100 dark:border-slate-700/50">
                    <div className="relative">
                        <div
                            onClick={() => formData.image && setIsImageModalOpen(true)}
                            className={`w-32 h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative group ${formData.image ? 'cursor-zoom-in' : ''}`}
                        >
                            {formData.image ? (
                                <img src={formData.image} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <User className="w-12 h-12 text-slate-400" />
                            )}
                            {imageUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-3 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95 group">
                            <Camera className="w-5 h-5" />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={imageUploading}
                            />
                        </label>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                            {formData.name || 'Your Name'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">{formData.email}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold rounded-full border border-brand-100 dark:border-brand-800">
                                Customer Account
                            </span>
                            <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full border border-green-100 dark:border-green-800">
                                Verified
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500  font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                            placeholder="017XXXXXXXX"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Shipping Address</label>
                    <textarea
                        rows={4}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none font-medium"
                        placeholder="Enter your street address, apartment, etc."
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-brand-500/25 flex items-center gap-3 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Profile</>}
                    </button>
                </div>
            </form>

            <ImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                imageUrl={formData.image}
                altText={formData.name}
            />
        </div>
    );
}
