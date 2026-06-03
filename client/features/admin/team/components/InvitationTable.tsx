'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { UserRole } from '@/lib/enums/user-role.enum';
import { Clock, Mail, XCircle } from 'lucide-react';
import React, { useMemo } from 'react';
import { Invitation, InvitationTableProps } from '../type';



const InvitationTable: React.FC<InvitationTableProps> = ({
    invitations,
    handleRevokeInvitation,
    roleIcons,
    roleColors
}) => {
    const columns = useMemo<DataTableColumn<Invitation>[]>(() => [
        {
            key: 'email',
            header: 'Invited Email',
            className: 'text-sm text-slate-700 dark:text-slate-300 font-bold',
            cell: (inv) => inv.email,
        },
        {
            key: 'role',
            header: 'Assigned Role',
            cell: (inv) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roleColors[inv.role] || roleColors[UserRole.USER]}`}>
                    {roleIcons[inv.role] || roleIcons[UserRole.USER]} {inv.role}
                </span>
            ),
        },
        {
            key: 'expiration',
            header: 'Expiration',
            cell: (inv) => (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(inv.expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            cell: (inv) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => handleRevokeInvitation(inv.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-100 dark:border-slate-800 transition-all hover:border-rose-200 dark:hover:border-rose-900 group"
                    >
                        <XCircle className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />
                        Revoke Invite
                    </button>
                </div>
            ),
        },
    ], [handleRevokeInvitation, roleColors, roleIcons]);

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500 font-display">
            <DataTable
                data={invitations}
                columns={columns}
                getRowKey={(inv) => inv.id}
                loading={false}
                emptyLabel={
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-black text-slate-900 dark:text-white">No pending invitations</p>
                    <p className="text-xs font-medium mt-1">All processed or revoked invitations are cleared.</p>
                </div>
                }
                containerClassName="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
        </div>
    );
};

export default React.memo(InvitationTable);
