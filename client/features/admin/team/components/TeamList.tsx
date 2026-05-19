'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserRole } from '@/lib/enums/user-role.enum';
import {
    Users,
    UserPlus,
    Crown,
    Settings,
    Mail,
    RefreshCcw,
    ShieldCheck,
} from 'lucide-react';
import InviteStaffModal from './InviteStaffModal';
import TeamStatsGrid from './TeamStatsGrid';
import MemberTable from './MemberTable';
import InvitationTable from './InvitationTable';
import ManageAccessModal from './ManageAccessModal';
import { TeamMember, Invitation } from '../type';

const roleIcons: Record<UserRole, React.ReactElement> = {
    [UserRole.ADMIN]: <Crown className="w-3.5 h-3.5 text-amber-500" />,
    [UserRole.OPERATOR]: <Settings className="w-3.5 h-3.5 text-blue-500" />,
    [UserRole.USER]: <Users className="w-3.5 h-3.5 text-slate-400" />,
    [UserRole.SUPER_ADMIN]: <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />,
    [UserRole.STORE_MANAGER]: <Settings className="w-3.5 h-3.5 text-blue-500" />,
    [UserRole.SUPPORT]: <Users className="w-3.5 h-3.5 text-slate-400" />,
    [UserRole.MARKETING]: <Settings className="w-3.5 h-3.5 text-blue-500" />,
    [UserRole.EMPLOYEE]: <Users className="w-3.5 h-3.5 text-slate-400" />,
};

const roleColors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-amber-100/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50',
    [UserRole.OPERATOR]: 'bg-blue-100/50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50',
    [UserRole.USER]: 'bg-slate-100/50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/50',
    [UserRole.SUPER_ADMIN]: 'bg-indigo-100/50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50',
    [UserRole.STORE_MANAGER]: 'bg-blue-100/50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50',
    [UserRole.SUPPORT]: 'bg-slate-100/50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/50',
    [UserRole.MARKETING]: 'bg-blue-100/50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50',
    [UserRole.EMPLOYEE]: 'bg-slate-100/50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/50',
};

export default function TeamList() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { fetchAPI } = await import('@/services/api');
            const res = await fetchAPI('/users/team');
            if (res?.data) {
                setMembers(res.data.members ?? []);
                setInvitations(res.data.pendingInvitations ?? []);
            }
        } catch (err) {
            console.error('Failed to fetch team data', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRevokeInvitation = useCallback(async (invitationId: string) => {
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/team/invitations/${invitationId}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Failed to revoke invitation', err);
        }
    }, [fetchData]);

    const handleRoleChange = useCallback(async (memberId: string, role: UserRole) => {
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/team/members/${memberId}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role }),
            });
            setActiveDropdown(null);
            fetchData();
        } catch (err) {
            console.error('Failed to update role', err);
        }
    }, [fetchData]);

    const handleRemoveMember = useCallback(async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/team/members/${memberId}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Failed to remove member', err);
        }
    }, [fetchData]);

    const getInitials = useCallback((name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2), []);

    const memberStats = useMemo(() => ({
        total: members.length,
        pending: invitations.length
    }), [members.length, invitations.length]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display tracking-tight">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                            <ShieldCheck className="w-8 h-8 text-indigo-600" />
                        </div>
                        Team Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-lg">
                        Define roles and manage staff credentials for your e-commerce ecosystem.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all hover:scale-110 active:rotate-180 duration-500 shadow-sm"
                        title="Refresh List"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition-all hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 font-display"
                    >
                        <UserPlus className="w-5 h-5" />
                        Invite Staff
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <TeamStatsGrid members={members} invitations={invitations} />

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 font-display">
                <button
                    onClick={() => setActiveTab('members')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all ${activeTab === 'members' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md transform scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Users className="w-4 h-4" /> Members ({memberStats.total})
                </button>
                <button
                    onClick={() => setActiveTab('invitations')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black tracking-tight transition-all ${activeTab === 'invitations' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md transform scale-105' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    <Mail className="w-4 h-4" /> Invitations ({memberStats.pending})
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 rounded-full" />
                        <div className="absolute top-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Team Data...</p>
                </div>
            ) : activeTab === 'members' ? (
                <MemberTable
                    members={members}
                    activeDropdown={activeDropdown}
                    setActiveDropdown={setActiveDropdown}
                    handleRoleChange={handleRoleChange}
                    handleRemoveMember={handleRemoveMember}
                    handleEditRole={(member) => {
                        setEditingMember(member);
                        setActiveDropdown(null);
                    }}
                    roleIcons={roleIcons}
                    roleColors={roleColors}
                    getInitials={getInitials}
                />
            ) : (
                <InvitationTable
                    invitations={invitations}
                    handleRevokeInvitation={handleRevokeInvitation}
                    roleIcons={roleIcons}
                    roleColors={roleColors}
                />
            )}

            {showInviteModal && (
                <InviteStaffModal
                    onClose={() => setShowInviteModal(false)}
                    onInvited={fetchData}
                />
            )}

            {editingMember && (
                <ManageAccessModal
                    member={editingMember}
                    onClose={() => setEditingMember(null)}
                    onUpdated={fetchData}
                />
            )}
        </div>
    );
}
