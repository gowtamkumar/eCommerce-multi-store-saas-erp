'use client';

import React from 'react';
import { Shield, Plus, Key, Edit, Trash2, Check, Loader2 } from 'lucide-react';
import { useRolesDashboard } from '../hooks/useRolesDashboard';
import RoleFormModal from './RoleFormModal';

export default function RolesDashboard() {
    const {
        roles,
        groupedPermissions,
        loading,
        showModal,
        setShowModal,
        editingRole,
        fetchData,
        handleOpenCreate,
        handleOpenEdit,
        handleDelete,
    } = useRolesDashboard();

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
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
                                                <span>{role.name}</span>
                                                {role.isSystemRole && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 font-medium">
                                                        System
                                                    </span>
                                                )}
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium capitalize">
                                                    {role.scopeType?.toLowerCase()}
                                                </span>
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
                                            {role.description || 'No description provided.'}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-955/40 px-3 py-1 rounded-xl">
                                            {role.permissions?.length || 0} Permissions
                                        </span>
                                        {!role.isSystemRole && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleOpenEdit(role)}
                                                    className="p-2 rounded-xl text-slate-555 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                                    title="Edit Role"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(role.id)}
                                                    className="p-2 rounded-xl text-slate-555 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20 transition-all"
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
                                                    <h4 className="text-xs font-black text-slate-850 dark:text-slate-200">
                                                        {p.name}
                                                    </h4>
                                                    <code className="text-[10px] text-slate-400 block mt-0.5">
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

            <RoleFormModal
                isOpen={showModal}
                editingRole={editingRole}
                groupedPermissions={groupedPermissions}
                onClose={() => setShowModal(false)}
                onSuccess={() => {
                    setShowModal(false);
                    void fetchData();
                }}
            />
        </div>
    );
}
