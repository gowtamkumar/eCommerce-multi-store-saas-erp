'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Shield, Plus, Key, Edit, Trash2, CheckSquare, Square, Check, Loader2 } from 'lucide-react';

interface Permission {
    id: string;
    code: string;
    name: string;
    description: string;
    module: string;
}

interface Role {
    id: string;
    name: string;
    description: string;
    isSystemDefault: boolean;
    permissions: Permission[];
}

export default function RolesPermissionsPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { fetchAPI } = await import('@/services/api');
            const [rolesRes, permsRes] = await Promise.all([
                fetchAPI('/users/roles'),
                fetchAPI('/users/permissions'),
            ]);
            if (rolesRes?.data) setRoles(rolesRes.data);
            if (permsRes?.data) setPermissions(permsRes.data);
        } catch (err) {
            console.error('Failed to load roles and permissions', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenCreate = () => {
        setEditingRole(null);
        setName('');
        setDescription('');
        setSelectedPermissions([]);
        setShowModal(true);
    };

    const handleOpenEdit = (role: Role) => {
        setEditingRole(role);
        setName(role.name);
        setDescription(role.description || '');
        setSelectedPermissions(role.permissions.map(p => p.code));
        setShowModal(true);
    };

    const handleTogglePermission = (code: string) => {
        setSelectedPermissions(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const handleToggleModule = (module: string, modulePermissions: Permission[]) => {
        const codes = modulePermissions.map(p => p.code);
        const allSelected = codes.every(c => selectedPermissions.includes(c));
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(c => !codes.includes(c)));
        } else {
            setSelectedPermissions(prev => Array.from(new Set([...prev, ...codes])));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            const { fetchAPI } = await import('@/services/api');
            const payload = { name, description, permissionCodes: selectedPermissions };

            if (editingRole) {
                await fetchAPI(`/users/roles/${editingRole.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });
            } else {
                await fetchAPI('/users/roles', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error('Failed to save role', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (roleId: string) => {
        if (!confirm('Are you sure you want to delete this custom role? This will orphan any users assigned to it.')) return;
        try {
            const { fetchAPI } = await import('@/services/api');
            await fetchAPI(`/users/roles/${roleId}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error('Failed to delete role', err);
        }
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
        if (!acc[p.module]) acc[p.module] = [];
        acc[p.module].push(p);
        return acc;
    }, {});

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 font-display tracking-tight">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
                            <Shield className="w-8 h-8 text-indigo-600" />
                        </div>
                        Roles & Permissions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-lg">
                        Configure customized administrative authorization groups and control fine-grained access rules.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black transition-all hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 font-display"
                >
                    <Plus className="w-5 h-5" />
                    Create Custom Role
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Authorization Matrix...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Roles list */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 font-display tracking-tight px-1">
                            Available Roles
                        </h2>
                        <div className="space-y-3">
                            {roles.map(role => (
                                <div
                                    key={role.id}
                                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {role.name}
                                                {role.isSystemDefault && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 font-medium">
                                                        System
                                                    </span>
                                                )}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                                            {role.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-xl">
                                            {role.permissions?.length || 0} Permissions
                                        </span>
                                        {!role.isSystemDefault && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleOpenEdit(role)}
                                                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                                    title="Edit Role"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(role.id)}
                                                    className="p-2 rounded-xl text-slate-550 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                                    title="Delete Role"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Permissions list */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 font-display tracking-tight px-1 flex items-center gap-2">
                            <Key className="w-5 h-5 text-indigo-500" />
                            Dynamic Capability Directory
                        </h2>
                        <div className="space-y-6">
                            {Object.entries(groupedPermissions).map(([module, modulePerms]) => (
                                <div
                                    key={module}
                                    className="p-6 rounded-3xl bg-white dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/40 shadow-sm space-y-4"
                                >
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
                                        <h3 className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {module}
                                        </h3>
                                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                            {modulePerms.length} Capabilities
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {modulePerms.map(p => (
                                            <div
                                                key={p.id}
                                                className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-700/30 flex items-start gap-3"
                                            >
                                                <div className="p-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg mt-0.5">
                                                    <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                                                        {p.name}
                                                    </h4>
                                                    <code className="text-[10px] text-slate-450 block mt-0.5">
                                                        {p.code}
                                                    </code>
                                                    <p className="text-[11px] text-slate-500 mt-1 font-medium leading-normal">
                                                        {p.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
                            <div>
                                <h3 className="text-xl font-black text-slate-950 dark:text-white font-display tracking-tight">
                                    {editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                    Define the role name and select the functional permissions it grants.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Role Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        placeholder="e.g. Senior Inventory Clerk"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-semibold shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Briefly state this role's target responsibilities"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-semibold shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* Permission selection check matrix */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                                    Select Dynamic Capabilities
                                </label>
                                <div className="space-y-4">
                                    {Object.entries(groupedPermissions).map(([module, modulePerms]) => {
                                        const codes = modulePerms.map(p => p.code);
                                        const allSelected = codes.every(c => selectedPermissions.includes(c));
                                        const someSelected = codes.some(c => selectedPermissions.includes(c)) && !allSelected;

                                        return (
                                            <div
                                                key={module}
                                                className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                                            >
                                                <div
                                                    onClick={() => handleToggleModule(module, modulePerms)}
                                                    className="p-4 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all select-none"
                                                >
                                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                                        {allSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                        ) : someSelected ? (
                                                            <div className="w-4 h-4 rounded bg-indigo-500/20 border border-indigo-500 flex items-center justify-center">
                                                                <div className="w-2 h-0.5 bg-indigo-600 rounded" />
                                                            </div>
                                                        ) : (
                                                            <Square className="w-4 h-4 text-slate-400" />
                                                        )}
                                                        {module}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                                        Select All
                                                    </span>
                                                </div>
                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white dark:bg-slate-900">
                                                    {modulePerms.map(p => {
                                                        const isChecked = selectedPermissions.includes(p.code);
                                                        return (
                                                            <div
                                                                key={p.id}
                                                                onClick={() => handleTogglePermission(p.code)}
                                                                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${isChecked ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-sm' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                                                            >
                                                                {isChecked ? (
                                                                    <CheckSquare className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                                                ) : (
                                                                    <Square className="w-4 h-4 text-slate-350 mt-0.5 flex-shrink-0" />
                                                                )}
                                                                <div>
                                                                    <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 leading-none">
                                                                        {p.name}
                                                                    </h5>
                                                                    <p className="text-[10px] text-slate-500 mt-1 font-medium leading-normal">
                                                                        {p.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-black tracking-wider uppercase transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-95"
                            >
                                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {editingRole ? 'Update Role' : 'Create Role'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
