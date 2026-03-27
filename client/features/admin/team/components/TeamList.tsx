'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { UserRole } from '@/lib/enums/user-role.enum';
import {
    Users,
    UserPlus,
    Crown,
    Settings,
    Trash2,
    Mail,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal,
    RefreshCcw,
    ShieldCheck,
} from 'lucide-react';
import InviteStaffModal from './InviteStaffModal';
import { TeamMember, Invitation } from '../type';

const roleIcons: Record<UserRole, React.ReactElement> = {
    [UserRole.ADMIN]: <Crown className="w-3.5 h-3.5 text-amber-500" />,
    [UserRole.OPERATOR]: <Settings className="w-3.5 h-3.5 text-blue-500" />,
    [UserRole.USER]: <Users className="w-3.5 h-3.5 text-slate-400" />,
    [UserRole.SUPER_ADMIN]: <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />,
    [UserRole.STORE_MANAGER]: <Settings className="w-3.5 h-3.5 text-blue-500" />,
    [UserRole.SUPPORT]: <Users className="w-3.5 h-3.5 text-slate-400" />,
    [UserRole.MARKETING]: <Settings className="w-3.5 h-3.5 text-blue-500" />,
};

const roleColors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    [UserRole.OPERATOR]: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    [UserRole.USER]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    [UserRole.SUPER_ADMIN]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400',
    [UserRole.STORE_MANAGER]: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    [UserRole.SUPPORT]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    [UserRole.MARKETING]: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
};

export default function TeamList() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
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

    const handleRevokeInvitation = async (invitationId: string) => {
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/team/invitations/${invitationId}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Failed to revoke invitation', err);
        }
    };

    const handleRoleChange = async (memberId: string, role: UserRole) => {
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
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/team/members/${memberId}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Failed to remove member', err);
        }
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-indigo-500" />
                        Team Management
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Invite staff and manage their access roles.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        id="refresh-team-btn"
                        onClick={fetchData}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                    <button
                        id="invite-staff-btn"
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
                    >
                        <UserPlus className="w-4 h-4" />
                        Invite Staff
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Members', value: members.length, icon: <Users className="w-5 h-5 text-indigo-500" />, color: 'bg-indigo-50 dark:bg-indigo-950/30' },
                    { label: 'Admins', value: members.filter(m => m.role === UserRole.ADMIN).length, icon: <Crown className="w-5 h-5 text-amber-500" />, color: 'bg-amber-50 dark:bg-amber-950/30' },
                    { label: 'Operators', value: members.filter(m => m.role === UserRole.OPERATOR).length, icon: <Settings className="w-5 h-5 text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-950/30' },
                    { label: 'Pending Invites', value: invitations.length, icon: <Clock className="w-5 h-5 text-orange-500" />, color: 'bg-orange-50 dark:bg-orange-950/30' },
                ].map((stat) => (
                    <div key={stat.label} className={`${stat.color} rounded-2xl p-4 border border-slate-100 dark:border-slate-800`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
                <button
                    id="tab-members"
                    onClick={() => setActiveTab('members')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'members' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Users className="w-4 h-4" /> Members ({members.length})
                </button>
                <button
                    id="tab-invitations"
                    onClick={() => setActiveTab('invitations')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'invitations' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <Mail className="w-4 h-4" /> Pending ({invitations.length})
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : activeTab === 'members' ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {members.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Users className="w-12 h-12 mb-3 opacity-30" />
                            <p className="font-medium">No team members yet.</p>
                            <p className="text-sm">Invite someone to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Member</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Role</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Status</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Joined</th>
                                    <th className="px-5 py-3.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {members.map((member) => (
                                    <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {member.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={member.image} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {getInitials(member.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-white">{member.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{member.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[member.role]}`}>
                                                {roleIcons[member.role]}
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${member.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                {member.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(member.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="relative flex justify-end">
                                                <button
                                                    id={`member-menu-${member.id}`}
                                                    onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                                {activeDropdown === member.id && (
                                                    <div className="absolute right-0 top-8 z-10 w-44 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                                                        <div className="p-1">
                                                            <p className="text-xs text-slate-400 px-3 py-2 font-medium">Change Role</p>
                                                            {Object.values(UserRole).map((r) => (
                                                                <button
                                                                    key={r}
                                                                    id={`change-role-${r.toLowerCase()}-${member.id}`}
                                                                    onClick={() => handleRoleChange(member.id, r)}
                                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${member.role === r ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                                >
                                                                    {roleIcons[r]} {r}
                                                                </button>
                                                            ))}
                                                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                                                            <button
                                                                id={`remove-member-${member.id}`}
                                                                onClick={() => { setActiveDropdown(null); handleRemoveMember(member.id); }}
                                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                /* Invitations Tab */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {invitations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <Mail className="w-12 h-12 mb-3 opacity-30" />
                            <p className="font-medium">No pending invitations.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Email</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Role</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-slate-600 dark:text-slate-300">Expires</th>
                                    <th className="px-5 py-3.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {invitations.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-medium">{inv.email}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[inv.role] || roleColors['User']}`}>
                                                {roleIcons[inv.role] || roleIcons['User']} {inv.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(inv.expiresAt).toLocaleString()}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                id={`revoke-invitation-${inv.id}`}
                                                onClick={() => handleRevokeInvitation(inv.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900 transition-colors"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Revoke
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {showInviteModal && (
                <InviteStaffModal
                    onClose={() => setShowInviteModal(false)}
                    onInvited={fetchData}
                />
            )}
        </div>
    );
}
