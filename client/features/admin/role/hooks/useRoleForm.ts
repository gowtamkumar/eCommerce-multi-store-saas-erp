'use client';

import { useState, useEffect, useCallback } from 'react';
import { RoleScopeType } from '../types';
import type { Role, Permission } from '../types';

export interface UseRoleFormOptions {
    editingRole: Role | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function useRoleForm({ editingRole, onClose, onSuccess }: UseRoleFormOptions) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [scopeType, setScopeType] = useState<RoleScopeType>(RoleScopeType.GLOBAL);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editingRole) {
            setName(editingRole.name);
            setDescription(editingRole.description || '');
            setScopeType(editingRole.scopeType || RoleScopeType.GLOBAL);
            setSelectedPermissions(editingRole.permissions?.map(p => p.code) || []);
        } else {
            setName('');
            setDescription('');
            setScopeType(RoleScopeType.GLOBAL);
            setSelectedPermissions([]);
        }
    }, [editingRole]);

    const handleTogglePermission = useCallback((code: string) => {
        setSelectedPermissions(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    }, []);

    const handleToggleModule = useCallback((module: string, modulePermissions: Permission[]) => {
        const codes = modulePermissions.map(p => p.code);
        const allSelected = codes.every(c => selectedPermissions.includes(c));
        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(c => !codes.includes(c)));
        } else {
            setSelectedPermissions(prev => Array.from(new Set([...prev, ...codes])));
        }
    }, [selectedPermissions]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            const { fetchAPI } = await import('@/services/api');
            const payload = { name, description, scopeType, permissionCodes: selectedPermissions };

            if (editingRole) {
                await fetchAPI(`/rbac/roles/${editingRole.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });
            } else {
                await fetchAPI('/rbac/roles', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            onSuccess();
        } catch (err) {
            console.error('Failed to save role', err);
        } finally {
            setSubmitting(false);
        }
    }, [name, description, scopeType, selectedPermissions, editingRole, onSuccess]);

    return {
        name,
        setName,
        description,
        setDescription,
        scopeType,
        setScopeType,
        selectedPermissions,
        setSelectedPermissions,
        submitting,
        handleTogglePermission,
        handleToggleModule,
        handleSubmit,
    };
}
