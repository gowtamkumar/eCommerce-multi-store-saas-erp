import React from 'react';
import { CheckSquare, Square, Loader2 } from 'lucide-react';
import { useRoleForm } from '../hooks/useRoleForm';
import { RoleScopeType } from '../types';
import type { Role, Permission } from '../types';

export interface RoleFormModalProps {
    isOpen: boolean;
    editingRole: Role | null;
    groupedPermissions: Record<string, Permission[]>;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RoleFormModal({
    isOpen,
    editingRole,
    groupedPermissions,
    onClose,
    onSuccess,
}: RoleFormModalProps) {
    const {
        name,
        setName,
        description,
        setDescription,
        scopeType,
        setScopeType,
        selectedPermissions,
        submitting,
        handleTogglePermission,
        handleToggleModule,
        handleSubmit,
    } = useRoleForm({ editingRole, onClose, onSuccess });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
                    <div>
                        <h3 className="text-xl font-black text-slate-955 dark:text-white font-display tracking-tight">
                            {editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Define the role name and select the functional permissions it grants.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                Scope Type
                            </label>
                            <select
                                value={scopeType}
                                onChange={e => setScopeType(e.target.value as RoleScopeType)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-semibold shadow-sm"
                            >
                                <option value={RoleScopeType.GLOBAL}>Global (All Locations)</option>
                                <option value={RoleScopeType.BRANCH}>Branch Specific</option>
                                <option value={RoleScopeType.WAREHOUSE}>Warehouse Specific</option>
                            </select>
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
                                                            <h5 className="text-[11px] font-black text-slate-850 dark:text-slate-200 leading-none">
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
                        onClick={onClose}
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
    );
}
