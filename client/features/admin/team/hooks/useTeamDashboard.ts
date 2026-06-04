'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole } from '@/lib/enums/user-role.enum';
import type { TeamMember, Invitation } from '../type';

export function useTeamDashboard() {
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
        void fetchData();
    }, [fetchData]);

    const handleRevokeInvitation = useCallback(async (invitationId: string) => {
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/team/invitations/${invitationId}`, { method: 'DELETE' });
            void fetchData();
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
            void fetchData();
        } catch (err) {
            console.error('Failed to update role', err);
        }
    }, [fetchData]);

    const handleRemoveMember = useCallback(async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) return;
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/team/members/${memberId}`, { method: 'DELETE' });
            void fetchData();
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

    return {
        members,
        invitations,
        loading,
        showInviteModal,
        setShowInviteModal,
        editingMember,
        setEditingMember,
        activeDropdown,
        setActiveDropdown,
        activeTab,
        setActiveTab,
        fetchData,
        handleRevokeInvitation,
        handleRoleChange,
        handleRemoveMember,
        getInitials,
        memberStats,
    };
}
