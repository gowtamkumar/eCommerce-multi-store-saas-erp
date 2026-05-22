'use client';

import ImageModal from '@/components/shared/ImageModal';
import { fetchAPI } from '@/services/api';
import { Camera, Loader2, Lock, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfileForm({ variant, formData, setFormData }: { variant?: 'personal' | 'security', formData: any, setFormData: any }) {
    const { data: session, status, update } = useSession();

    const [loading, setLoading] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await fetchAPI(`/users/${formData?.id}`, {
                method: 'PATCH',
                body: JSON.stringify(formData),
            });

            if (data.success) {
                await update(data.user); // Update session
                toast.success('Profile saved successfully');
            } else {
                toast.error('Could not update profile');
            }
        } catch (error) {
            toast.error('System error during update');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setImageUploading(true);
        try {
            // Step 1: Request presigned URL from backend
            const presignedRes = await fetchAPI('/admin/media/presigned-url', {
                method: 'POST',
                body: JSON.stringify({
                    filename: file.name,
                    mimetype: file.type,
                    size: file.size,
                }),
            });

            if (presignedRes.success && presignedRes.data?.uploadUrl) {
                const { uploadUrl, downloadUrl } = presignedRes.data;

                // Step 2: Upload raw file binary to MinIO via PUT
                const uploadRes = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type,
                    },
                });

                if (!uploadRes.ok) {
                    throw new Error('Failed to upload file directly to MinIO');
                }

                setFormData((prev: any) => ({ ...prev, image: downloadUrl }));
                toast.success('Avatar updated');
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Upload error');
        } finally {
            setImageUploading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            const data = await fetchAPI(`/users/update-password/${formData?.id}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (data.success) {
                toast.success('Security credentials updated');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Identity verification failed');
            }
        } catch (error) {
            toast.error('Security update error');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (variant === 'security') {
        return (
            <div className="p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Credentials</h4>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Manage your password and identity keys</p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-8 max-w-2xl">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Existing Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full pl-14 pr-5 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Key</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full pl-14 pr-5 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium"
                                        placeholder="Min. 8 chars"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Key</label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full pl-14 pr-5 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium"
                                        placeholder="Repeat new key"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="w-full px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-[2rem] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-2xl shadow-slate-900/10 dark:shadow-none"
                    >
                        {passwordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Security Credentials'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12">
            <form onSubmit={handleProfileUpdate} className="space-y-12">
                {/* Advanced Profile Identity Section */}
                <div className="flex flex-col md:flex-row items-start gap-10">
                    <div className="relative group">
                        <div
                            onClick={() => formData.image && setIsImageModalOpen(true)}
                            className={`w-40 h-40 rounded-[3rem] bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl relative transition-transform duration-500 group-hover:rotate-3 ${formData.image ? 'cursor-zoom-in' : ''}`}
                        >
                            {formData.image ? (
                                <img src={formData.image} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <User className="w-16 h-16 text-slate-300" />
                            )}
                            {imageUploading && (
                                <div className="absolute inset-0 bg-brand-900/80 flex items-center justify-center backdrop-blur-md">
                                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-4 bg-brand-600 text-white rounded-[1.5rem] hover:bg-brand-700 transition-all shadow-2xl cursor-pointer hover:scale-110 active:scale-90 ring-4 ring-white dark:ring-slate-950 group/btn">
                            <Camera className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={imageUploading}
                            />
                        </label>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-2">Member Identity</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                {formData.name || 'Anonymous User'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 mt-1">
                                {formData.email}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Standard Account
                            </div>
                            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30 text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
                                Profile Verified
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Fields Section */}
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="text"
                                required
                                value={formData.name ?? ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-14 pr-5 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-400"
                                placeholder="e.g. Alexander Pierce"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Vector</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                required
                                readOnly
                                value={formData.email ?? ''}
                                className="w-full pl-14 pr-5 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 font-bold cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Terminal</label>
                        <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="tel"
                                required
                                value={formData.phone ?? ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-14 pr-5 py-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold placeholder:text-slate-400"
                                placeholder="+1 000 000 0000"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-slate-50 dark:border-slate-800/50">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-12 py-5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-widest rounded-[2rem] transition-all shadow-2xl shadow-brand-500/25 flex items-center justify-center gap-3 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98] ring-offset-2 ring-brand-500 focus:ring-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-6 h-6" /> Commit Changes</>}
                    </button>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Your data is encrypted and secure
                    </p>
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
