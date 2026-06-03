'use client';

import DataTable, { DataTableColumn } from '@/components/shared/DataTable';
import { CheckCircle, MoreHorizontal, Trash2, UserCog, Users, XCircle } from 'lucide-react';
import React, { useMemo } from 'react';
import { MemberTableProps, TeamMember } from '../type';



const MemberTable: React.FC<MemberTableProps> = ({
    members,
    activeDropdown,
    setActiveDropdown,
    handleRoleChange,
    handleRemoveMember,
    handleEditRole,
    roleIcons,
    roleColors,
    getInitials
}) => {
    void handleRoleChange;
    void roleIcons;
    void roleColors;

    const columns = useMemo<DataTableColumn<TeamMember>[]>(() => [
        {
            key: 'member',
            header: 'Team Member',
            cell: (member) => (
                <div className="flex items-center gap-3">
                    {member.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.image} alt={member.name} className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-all" />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {getInitials(member.name)}
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-slate-900 dark:text-white capitalize">{member.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{member.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Access Role',
            cell: (member) => member.roleAssignments && member.roleAssignments.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {member.roleAssignments.map((assignment) => (
                        <span key={assignment.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50">
                            {assignment.role?.name || 'Unknown Role'}
                        </span>
                    ))}
                </div>
            ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {member.role || 'No Roles'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            cell: (member) => (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${member.status === 'active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-50 text-slate-500 dark:bg-slate-800'}`}>
                    {member.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {member.status}
                </span>
            ),
        },
        {
            key: 'joined',
            header: 'Joined Date',
            className: 'text-xs text-slate-500 dark:text-slate-400 font-medium',
            cell: (member) => new Date(member.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            cell: (member) => (
                <div className="relative flex justify-end">
                    <button
                        onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                        className={`p-1.5 rounded-lg transition-all ${activeDropdown === member.id ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white ring-2 ring-indigo-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {activeDropdown === member.id && (
                        <div className="absolute right-0 top-10 z-20 w-44 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-1.5 space-y-0.5">
                                <button
                                    onClick={() => handleEditRole(member)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-bold"
                                >
                                    <UserCog className="w-3.5 h-3.5 text-indigo-500" /> Manage Access
                                </button>
                                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all font-bold"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove Member
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
    ], [activeDropdown, getInitials, handleEditRole, handleRemoveMember, setActiveDropdown]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 font-display">
            <DataTable
                data={members}
                columns={columns}
                getRowKey={(member) => member.id}
                loading={false}
                emptyLabel={
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                        <Users className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-black text-slate-900 dark:text-white">No team members yet</p>
                    <p className="text-xs font-medium mt-1">Invite your first staff member to get started.</p>
                </div>
                }
                containerClassName="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[260px]"
                tableWrapperClassName="min-h-[220px]"
            />
        </div>
    );
};

export default React.memo(MemberTable);
