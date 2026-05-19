'use client';

import { UserRole } from '@/lib/enums/user-role.enum';
import { ArrowRight, Building2, Loader2, Mail, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { InviteStaffModalProps } from '../type';

// const roles = [
//     { value: UserRole.ADMIN, label: 'Admin', description: 'Complete system privileges.' },
//     { value: UserRole.MARKETING, label: 'Marketing', description: 'Manage coupons & campaigns.' },
//     { value: UserRole.STORE_MANAGER, label: 'Store Manager', description: 'Supervise catalogs & catalog stocks.' },
//     { value: UserRole.OPERATOR, label: 'Operator', description: 'Process POS & logistics orders.' },
//     { value: UserRole.SUPPORT, label: 'Support', description: 'Manage profiles & support tickets.' },
//     { value: UserRole.EMPLOYEE, label: 'Employee', description: 'Clock attendance, process POS sales, and view catalogs.' },
// ];


export default function InviteStaffModal({ onClose, onInvited }: InviteStaffModalProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.OPERATOR);
    const [branches, setBranches] = useState<any[]>([]);
    const [branchId, setBranchId] = useState('');
    const [customRoles, setCustomRoles] = useState<any[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBranchesAndRoles = async () => {
            try {
                const { getBranches } = await import('@/services/organization');
                const { fetchAPI } = await import('@/services/api');

                const [branchesRes, rolesRes] = await Promise.all([
                    getBranches(),
                    fetchAPI('/users/roles'),
                ]);

                if (branchesRes.success && branchesRes.data) {
                    const items = branchesRes.data.items || branchesRes.data || [];
                    setBranches(items);
                    if (items.length > 0) {
                        setBranchId(items[0].id);
                    }
                }

                if (rolesRes?.success && rolesRes?.data) {
                    setCustomRoles(rolesRes.data);
                }
            } catch (err) {
                console.error('Failed to load branches or roles in invite modal:', err);
            }
        };
        fetchBranchesAndRoles();
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
                    role: selectedRoleId ? UserRole.EMPLOYEE : role,
                    roleId: selectedRoleId || undefined,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[8px] animate-in fade-in duration-300">
            <div
                className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[28px] shadow-[0_25px_50px_-12px_rgba(99,102,241,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.08)] border border-slate-200/60 dark:border-slate-800/60 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
            >
                {/* Visual Accent Gradient Top Border */}
                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/10 flex items-center justify-center shadow-inner">
                            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent font-display tracking-tight">
                                Invite Team Member
                            </h2>
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                                Add an administrator or operational staff profile.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105 duration-200"
                        id="close-invite-modal-btn"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Email Address
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="email"
                                id="invite-email-input"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="staff@example.com"
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all shadow-sm font-semibold placeholder-slate-300 dark:placeholder-slate-700"
                            />
                        </div>
                    </div>

                    {/* Home Branch select (full-width) */}
                    {branches.length > 0 && (
                        <div className="space-y-2">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                Home Branch
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                <select
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/30 text-slate-900 dark:text-white text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/80 outline-none transition-all appearance-none font-bold cursor-pointer"
                                >
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id} className="dark:bg-slate-950">
                                            {b.name} ({b.code})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                                    <X className="w-4 h-4 rotate-45" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Unified System & Custom Role Selector */}
                    <div className="space-y-3">
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Assign Account Role
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                            {[

                                ...customRoles.map(r => ({
                                    id: r.id,
                                    name: r.name,
                                    description: r.description || `${r.permissions?.length || 0} customized system capabilities.`,
                                    isCustom: true,
                                    roleType: UserRole.EMPLOYEE
                                }))
                            ].map((r) => {
                                const isSelected = r.isCustom
                                    ? selectedRoleId === r.id
                                    : (!selectedRoleId && role === r.roleType);

                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                            if (r.isCustom) {
                                                setSelectedRoleId(r.id);
                                                setRole(UserRole.EMPLOYEE);
                                            } else {
                                                setSelectedRoleId('');
                                                setRole(r.roleType as UserRole);
                                            }
                                        }}
                                        className={`group p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${isSelected
                                            ? 'border-indigo-500/80 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/5 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.12)]'
                                            : 'border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-950/10 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01]'
                                            }`}
                                    >
                                        {/* Glow visual backdrops */}
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-xl pointer-events-none rounded-full" />
                                        )}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full transition-transform ${isSelected ? 'bg-indigo-500 scale-125' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{r.name}</div>
                                            </div>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${r.isCustom
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-750 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-750'}`}>
                                                {r.isCustom ? 'Custom' : 'System'}
                                            </span>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-2 pl-4 leading-relaxed group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">
                                            {r.description}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Alert Message */}
                    {error && (
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        id="send-invitation-btn"
                        disabled={loading}
                        className="w-full relative overflow-hidden flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm transition-all duration-300 disabled:opacity-50 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.99]"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Send Invitation</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
