'use client';

import { Users } from 'lucide-react';
import React from 'react';
import { MemberTableProps } from '../type';
import MemberRow from './MemberRow';



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
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 font-display">
            {members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:rotate-12">
                        <Users className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="font-black text-slate-900 dark:text-white">No team members yet</p>
                    <p className="text-xs font-medium mt-1">Invite your first staff member to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto min-h-[260px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Team Member</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Role</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Joined Date</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {members.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    activeDropdown={activeDropdown}
                                    setActiveDropdown={setActiveDropdown}
                                    handleRoleChange={handleRoleChange}
                                    handleRemoveMember={handleRemoveMember}
                                    handleEditRole={handleEditRole}
                                    roleIcons={roleIcons}
                                    roleColors={roleColors}
                                    getInitials={getInitials}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default React.memo(MemberTable);
