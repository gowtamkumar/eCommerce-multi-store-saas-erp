'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ShieldAlert, X, ShieldCheck, ShieldBan, Trash2, Plus } from 'lucide-react';
import { TeamMember } from '../type';
import { RoleScopeType } from '@/features/admin/role/types';

interface ManageAccessModalProps {
    member: TeamMember;
    onClose: () => void;
    onUpdated: () => void;
}

export default function ManageAccessModal({
    member,
    onClose,
    onUpdated,
}: ManageAccessModalProps) {
    const [activeTab, setActiveTab] = useState<'roles' | 'overrides'>('roles');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Data lists
    const [assignedRoles, setAssignedRoles] = useState<any[]>([]);
    const [overrides, setOverrides] = useState<any[]>([]);
    const [availableRoles, setAvailableRoles] = useState<any[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    // Form states - Role
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedScopeType, setSelectedScopeType] = useState<RoleScopeType>(RoleScopeType.GLOBAL);
    const [selectedScopeId, setSelectedScopeId] = useState('');

    // Form states - Override
    const [selectedPermission, setSelectedPermission] = useState('');
    const [overrideEffect, setOverrideEffect] = useState<'ALLOW' | 'DENY'>('DENY');
    const [overrideReason, setOverrideReason] = useState('');
    const [overrideExpiresAt, setOverrideExpiresAt] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { fetchAPI } = await import('@/services/api');
            const [
                rolesRes,
                assignmentsRes,
                overridesRes,
                permsRes,
                branchesRes,
                warehousesRes
            ] = await Promise.all([
                fetchAPI('/rbac/roles'),
                fetchAPI(`/rbac/users/${member.id}/roles`),
                fetchAPI(`/rbac/users/${member.id}/overrides`),
                fetchAPI('/rbac/permissions'), // We need a flat list here, assuming this endpoint exists
                fetchAPI('/system/branches'),
                fetchAPI('/system/warehouses'),
            ]);

            if (rolesRes?.data) setAvailableRoles(rolesRes.data);
            if (assignmentsRes?.data) setAssignedRoles(assignmentsRes.data);
            if (overridesRes?.data) setOverrides(overridesRes.data);
            
            // Handle permissions. If it's a grouped response or flat, adapt.
            // Let's assume /rbac/permissions returns a flat array, if it's grouped, we flatten it.
            if (permsRes?.data) {
                if (Array.isArray(permsRes.data)) {
                    setAvailablePermissions(permsRes.data);
                } else {
                    // Flatten if grouped
                    const flat = Object.values(permsRes.data).flat();
                    setAvailablePermissions(flat);
                }
            }

            // The backend for branches might return { branches: [] } or just [] inside data
            if (branchesRes?.data) setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : branchesRes.data.branches || []);
            if (warehousesRes?.data) setWarehouses(Array.isArray(warehousesRes.data) ? warehousesRes.data : warehousesRes.data.warehouses || []);

        } catch (err: any) {
            console.error(err);
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    }, [member.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssignRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole) return;
        setSubmitting(true);
        setError('');
        try {
            const { fetchAPI } = await import('@/services/api');
            const payload: any = { 
                roleId: selectedRole,
                scopeType: selectedScopeType,
            };
            
            if (selectedScopeType !== RoleScopeType.GLOBAL) {
                if (!selectedScopeId) {
                    setError('Please select a scope target (Branch/Warehouse).');
                    setSubmitting(false);
                    return;
                }
                payload.scopeId = selectedScopeId;
            }

            await fetchAPI(`/rbac/users/${member.id}/roles`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            setSelectedRole('');
            setSelectedScopeType(RoleScopeType.GLOBAL);
            setSelectedScopeId('');
            onUpdated();
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to assign role.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddOverride = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPermission || !overrideReason) return;
        setSubmitting(true);
        setError('');
        try {
            const { fetchAPI } = await import('@/services/api');
            const payload = {
                permissionSlug: selectedPermission,
                effect: overrideEffect,
                reason: overrideReason,
                expiresAt: overrideExpiresAt ? new Date(overrideExpiresAt).toISOString() : null,
            };

            await fetchAPI(`/rbac/users/${member.id}/overrides`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            setSelectedPermission('');
            setOverrideReason('');
            setOverrideExpiresAt('');
            onUpdated();
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to add override.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRevokeRole = async (assignmentId: string) => {
        if (!confirm('Revoke this role assignment?')) return;
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/rbac/users/${member.id}/roles/${assignmentId}`, { method: 'DELETE' });
            onUpdated();
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to revoke role.');
        }
    };

    const handleRevokeOverride = async (overrideId: string) => {
        if (!confirm('Remove this permission override?')) return;
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/rbac/users/${member.id}/overrides/${overrideId}`, { method: 'DELETE' });
            onUpdated();
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Failed to remove override.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Manage Access</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Control dynamic role assignments and specific exceptions for <span className="font-bold text-slate-700 dark:text-slate-300">{member.name}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 px-6 pt-4 border-b border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`pb-3 text-sm font-black tracking-tight border-b-2 transition-all ${activeTab === 'roles' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                        Role Assignments
                    </button>
                    <button
                        onClick={() => setActiveTab('overrides')}
                        className={`pb-3 text-sm font-black tracking-tight border-b-2 transition-all ${activeTab === 'overrides' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                        Permission Overrides
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-4">
                            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Access Data...</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 font-medium">
                                    {error}
                                </div>
                            )}

                            {activeTab === 'roles' && (
                                <div className="space-y-6">
                                    {/* Active Assignments */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3">Active Roles</h3>
                                        {assignedRoles.length === 0 ? (
                                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">No roles assigned.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {assignedRoles.map((assignment) => (
                                                    <div key={assignment.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{assignment.role?.name || 'Unknown Role'}</span>
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                                                                    {assignment.scopeType || 'GLOBAL'}
                                                                </span>
                                                                {assignment.scopeId && (
                                                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                                                        ID: {assignment.scopeId}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button onClick={() => handleRevokeRole(assignment.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all" title="Revoke">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Assignment Form */}
                                    <form onSubmit={handleAssignRole} className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                            <Plus className="w-3.5 h-3.5" /> Assign New Role
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-slate-500">Select Role</label>
                                                                                <select
                                                                                    value={selectedRole}
                                                                                    onChange={e => setSelectedRole(e.target.value)}
                                                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                                                    required
                                                                                >
                                                                                    <option value="">-- Choose Role --</option>
                                                                                    {availableRoles.map(r => (
                                                                                        <option key={r.id} value={r.id}>{r.name}</option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>

                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-bold text-slate-500">Scope Type</label>
                                                                                <select
                                                                                    value={selectedScopeType}
                                                                                    onChange={e => {
                                                                                        setSelectedScopeType(e.target.value as RoleScopeType);
                                                                                        setSelectedScopeId('');
                                                                                    }}
                                                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                                                    required
                                                                                >
                                                                                    <option value={RoleScopeType.GLOBAL}>Global (All Locations)</option>
                                                                                    <option value={RoleScopeType.BRANCH}>Branch Specific</option>
                                                                                    <option value={RoleScopeType.WAREHOUSE}>Warehouse Specific</option>
                                                                                </select>
                                                                            </div>
                                                                            
                                                                            {selectedScopeType !== RoleScopeType.GLOBAL && (
                                                                                <div className="space-y-2 col-span-1 md:col-span-2">
                                                                                    <label className="text-xs font-bold text-slate-500">Select Target {selectedScopeType === RoleScopeType.BRANCH ? 'Branch' : 'Warehouse'}</label>
                                                                                    <select
                                                                                        value={selectedScopeId}
                                                                                        onChange={e => setSelectedScopeId(e.target.value)}
                                                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                                                        required
                                                                                    >
                                                                                        <option value="">-- Choose Location --</option>
                                                                                        {selectedScopeType === RoleScopeType.BRANCH 
                                                                                            ? branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)
                                                                                            : warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)
                                                                                        }
                                                                                    </select>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                Assign
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'overrides' && (
                                <div className="space-y-6">
                                    {/* Active Overrides */}
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3">Direct Overrides</h3>
                                        {overrides.length === 0 ? (
                                            <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">No active overrides.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {overrides.map((override) => (
                                                    <div key={override.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                {override.effect === 'ALLOW' ? (
                                                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                                                ) : (
                                                                    <ShieldBan className="w-4 h-4 text-rose-600" />
                                                                )}
                                                                <span className="font-bold text-slate-900 dark:text-white text-sm">{override.permission?.name || override.permissionSlug}</span>
                                                                <code className="text-[10px] text-slate-400">{override.permissionSlug}</code>
                                                            </div>
                                                            <div className="mt-2 text-[11px] text-slate-500 font-medium">
                                                                Reason: {override.reason}
                                                            </div>
                                                            {override.expiresAt && (
                                                                <div className="mt-1 text-[10px] text-amber-600 font-bold">
                                                                    Expires: {new Date(override.expiresAt).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button onClick={() => handleRevokeOverride(override.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all" title="Remove Override">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Override Form */}
                                    <form onSubmit={handleAddOverride} className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                            <Plus className="w-3.5 h-3.5" /> Add Exception
                                        </h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Capability</label>
                                                <select
                                                    value={selectedPermission}
                                                    onChange={e => setSelectedPermission(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    required
                                                >
                                                    <option value="">-- Choose Permission --</option>
                                                    {availablePermissions.map(p => (
                                                        <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500">Effect</label>
                                                <select
                                                    value={overrideEffect}
                                                    onChange={e => setOverrideEffect(e.target.value as any)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                    required
                                                >
                                                    <option value="DENY">Explicitly Deny</option>
                                                    <option value="ALLOW">Explicitly Allow</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Reason (Required)</label>
                                            <input
                                                type="text"
                                                value={overrideReason}
                                                onChange={e => setOverrideReason(e.target.value)}
                                                placeholder="Why is this exception necessary?"
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500">Expiration Date (Optional)</label>
                                            <input
                                                type="date"
                                                value={overrideExpiresAt}
                                                onChange={e => setOverrideExpiresAt(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                Add Override
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
