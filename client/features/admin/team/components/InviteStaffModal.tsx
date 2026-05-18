'use client';

import { UserRole } from '@/lib/enums/user-role.enum';
import { Loader2, Mail, UserCog, X, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { InviteStaffModalProps } from '../type';

const roles = [
    { value: UserRole.ADMIN, label: 'Admin', description: 'Full access to all features.' },
    { value: UserRole.MARKETING, label: 'Marketing', description: 'Can manage marketing features.' },
    { value: UserRole.STORE_MANAGER, label: 'Store Manager', description: 'Can manage store features.' },
    { value: UserRole.OPERATOR, label: 'Operator', description: 'Can manage orders, products, and customers.' },
    { value: UserRole.SUPPORT, label: 'Support', description: 'Can manage orders, products, and customers.' },
];

export default function InviteStaffModal({ onClose, onInvited }: InviteStaffModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.OPERATOR);
    const [branches, setBranches] = useState<any[]>([]);
    const [branchId, setBranchId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const { getBranches } = await import('@/services/organization');
                const res = await getBranches();
                if (res.success && res.data) {
                    const items = res.data.items || res.data || [];
                    setBranches(items);
                    if (items.length > 0) {
                        setBranchId(items[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to load branches in invite modal:', err);
            }
        };
        fetchBranches();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { fetchAPI } = await import('@/services/api');
            const res = await fetchAPI('/users/team/invite', {
                method: 'POST',
                body: JSON.stringify({ 
                    email, 
                    role, 
                    branchId: branchId || undefined 
                }),
            });

            if (res.success) {
                onInvited();
                onClose();
            } else {
                setError(res.message || 'Failed to send invitation.');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">They&apos;ll receive an email with a link to join.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        id="close-invite-modal-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                id="invite-email-input"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="staff@example.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
                            />
                        </div>
                    </div>

                    {/* Branch (Assigned Operating Branch Location) */}
                    {branches.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-indigo-500" /> Assigned Home Branch
                                </div>
                            </label>
                            <div className="relative">
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow appearance-none font-semibold cursor-pointer"
                                >
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} ({b.code})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                    <X className="w-4 h-4 rotate-45" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            <div className="flex items-center gap-1.5"><UserCog className="w-4 h-4" /> Assign Role</div>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {roles.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    id={`role-btn-${r.value.toLowerCase()}`}
                                    onClick={() => setRole(r.value as UserRole)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${role === r.value
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                        }`}
                                >
                                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{r.label}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-100 dark:border-red-900">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        id="send-invitation-btn"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </button>
                </form>
            </div>
        </div>
    );
}
