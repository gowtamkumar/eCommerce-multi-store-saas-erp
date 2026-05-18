'use client';

import { UserRole } from '@/lib/enums/user-role.enum';
import { Loader2, ShieldAlert, UserCheck, X } from 'lucide-react';
import React, { useState } from 'react';
import { TeamMember } from '../type';

interface ChangeRoleModalProps {
    member: TeamMember;
    onClose: () => void;
    onUpdated: () => void;
    roleIcons: Record<UserRole, React.ReactElement>;
}

const roles = [
    { value: UserRole.ADMIN, label: 'Admin', description: 'Full access to all features.' },
    { value: UserRole.STORE_MANAGER, label: 'Store Manager', description: 'Can manage store settings and features.' },
    { value: UserRole.OPERATOR, label: 'Operator', description: 'Can manage orders, products, and customers.' },
    { value: UserRole.SUPPORT, label: 'Support', description: 'General support desk and ticket management.' },
    { value: UserRole.MARKETING, label: 'Marketing', description: 'Can access and edit marketing promotions.' },
    { value: UserRole.EMPLOYEE, label: 'Employee', description: 'General operational staff member.' },
];

export default function ChangeRoleModal({
    member,
    onClose,
    onUpdated,
    roleIcons,
}: ChangeRoleModalProps) {
    const [selectedRole, setSelectedRole] = useState<UserRole>(member.role);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { fetchAPI } = await import('@/services/api');
            const res = await fetchAPI(`/users/team/members/${member.id}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role: selectedRole }),
            });

            if (res.success) {
                onUpdated();
                onClose();
            } else {
                setError(res.message || 'Failed to update member role.');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 overflow-hidden font-display">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Adjust Team Role</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Modify credentials and access privileges for <span className="font-bold text-slate-700 dark:text-slate-300">{member.name}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Select Access Tier</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                            {roles.map((r) => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setSelectedRole(r.value)}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                                        selectedRole === r.value
                                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/10'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {roleIcons[r.value] || roleIcons[UserRole.USER]}
                                            <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">{r.label}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                                            {r.description}
                                        </p>
                                    </div>
                                    {selectedRole === r.value && (
                                        <div className="mt-3 flex justify-end">
                                            <span className="text-[9px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-md tracking-wider">Active</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 font-medium">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 text-xs font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || selectedRole === member.role}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md hover:shadow-indigo-500/20"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                            Update Credentials
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
