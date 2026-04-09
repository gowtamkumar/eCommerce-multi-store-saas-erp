'use client';

import React from 'react';
import { Users, Crown, Settings, Clock } from 'lucide-react';
import { UserRole } from '@/lib/enums/user-role.enum';
import { TeamMember, Invitation } from '../type';

interface TeamStatsGridProps {
    members: TeamMember[];
    invitations: Invitation[];
}

const TeamStatsGrid: React.FC<TeamStatsGridProps> = ({ members, invitations }) => {
    const stats = [
        { 
            label: 'Total Members', 
            value: members.length, 
            icon: <Users className="w-5 h-5 text-indigo-500" />, 
            color: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50' 
        },
        { 
            label: 'Admins', 
            value: members.filter(m => m.role === UserRole.ADMIN).length, 
            icon: <Crown className="w-5 h-5 text-amber-500" />, 
            color: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50' 
        },
        { 
            label: 'Operators', 
            value: members.filter(m => m.role === UserRole.OPERATOR || m.role === UserRole.STORE_MANAGER).length, 
            icon: <Settings className="w-5 h-5 text-blue-500" />, 
            color: 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/50' 
        },
        { 
            label: 'Pending Invites', 
            value: invitations.length, 
            icon: <Clock className="w-5 h-5 text-orange-500" />, 
            color: 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50' 
        },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-display">
            {stats.map((stat) => (
                <div key={stat.label} className={`${stat.color} rounded-3xl p-5 border shadow-sm transition-all hover:shadow-md group`}>
                    <div className="flex items-center justify-between mb-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                        <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-black/5 dark:border-white/5 transition-transform group-hover:scale-110">
                            {stat.icon}
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-1 group-hover:translate-x-1 transition-transform">{stat.value}</div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(TeamStatsGrid);
