'use client';

import { UserRole } from '@/lib/enums/user-role.enum';
import { Clock, Mail, XCircle } from 'lucide-react';
import React from 'react';
import { InvitationTableProps } from '../type';



const InvitationTable: React.FC<InvitationTableProps> = ({
    invitations,
    handleRevokeInvitation,
    roleIcons,
    roleColors
}) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 font-display">
            {invitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-black text-slate-900 dark:text-white">No pending invitations</p>
                    <p className="text-xs font-medium mt-1">All processed or revoked invitations are cleared.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Invited Email</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Assigned Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Expiration</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {invitations.map((inv) => (
                                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-bold">{inv.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[inv.role] || roleColors[UserRole.USER]}`}>
                                            {roleIcons[inv.role] || roleIcons[UserRole.USER]} {inv.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(inv.expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleRevokeInvitation(inv.id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-100 dark:border-slate-800 transition-all hover:border-rose-200 dark:hover:border-rose-900 group"
                                            >
                                                <XCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                                                Revoke Invite
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default React.memo(InvitationTable);
