'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { ArAgingRow } from '@/features/admin/customer/type';
import type { DunningRule, DunningLog } from '../types';

export function useArDashboard() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'logs'>('dashboard');
    const [rows, setRows] = useState<ArAgingRow[]>([]);
    const [rules, setRules] = useState<DunningRule[]>([]);
    const [logs, setLogs] = useState<DunningLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [payingCustomer, setPayingCustomer] = useState<ArAgingRow | null>(null);
    const [editingRule, setEditingRule] = useState<Partial<DunningRule> | null>(null);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [runningAudit, setRunningAudit] = useState(false);
    const [selectedLog, setSelectedLog] = useState<DunningLog | null>(null);

    const fetchAging = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/finance/ar/aging');
            if (res.success) setRows(res.data || []);
        } catch {
            toast.error('Failed to load AR aging report');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRules = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/finance/ar/dunning/rules');
            if (res.success) setRules(res.data || []);
        } catch {
            toast.error('Failed to load dunning rules');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchAPI('/finance/ar/dunning/logs');
            if (res.success) setLogs(res.data || []);
        } catch {
            toast.error('Failed to load dunning logs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            void fetchAging();
        } else if (activeTab === 'rules') {
            void fetchRules();
        } else if (activeTab === 'logs') {
            void fetchLogs();
        }
    }, [activeTab, fetchAging, fetchRules, fetchLogs]);

    const handleRunAudit = useCallback(async () => {
        setRunningAudit(true);
        try {
            const res = await fetchAPI('/finance/ar/dunning/run-audit', { method: 'POST' });
            if (res.success) {
                toast.success(`Dunning audit finished: ${res.data.processed} accounts processed, ${res.data.logsCreated} notices generated.`);
                if (activeTab === 'dashboard') void fetchAging();
                else if (activeTab === 'logs') void fetchLogs();
            } else {
                toast.error(res.message || 'Audit execution failed');
            }
        } catch {
            toast.error('Failed to run dunning audit sweep');
        } finally {
            setRunningAudit(false);
        }
    }, [activeTab, fetchAging, fetchLogs]);

    const handleDeleteRule = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this dunning rule?')) return;
        try {
            const res = await fetchAPI(`/finance/ar/dunning/rules/${id}`, { method: 'DELETE' });
            if (res.success) {
                toast.success('Dunning rule deleted');
                void fetchRules();
            } else {
                toast.error(res.message || 'Failed to delete rule');
            }
        } catch {
            toast.error('Error deleting dunning rule');
        }
    }, [fetchRules]);

    const filtered = useMemo(() => {
        return rows.filter(r =>
            r.customerName.toLowerCase().includes(search.toLowerCase()) ||
            r.companyName?.toLowerCase().includes(search.toLowerCase()) ||
            r.customerEmail.toLowerCase().includes(search.toLowerCase())
        );
    }, [rows, search]);

    const totalOutstanding = useMemo(() => rows.reduce((s, r) => s + Number(r.totalOutstanding), 0), [rows]);
    const totalOverdue = useMemo(() => rows.reduce((s, r) => s + r.aging['1-30'] + r.aging['31-60'] + r.aging['61-90'] + r.aging['90+'], 0), [rows]);
    const holdCount = useMemo(() => rows.filter(r => r.creditHold).length, [rows]);

    return {
        activeTab,
        setActiveTab,
        rows,
        rules,
        logs,
        loading,
        search,
        setSearch,
        payingCustomer,
        setPayingCustomer,
        editingRule,
        setEditingRule,
        showRuleModal,
        setShowRuleModal,
        runningAudit,
        selectedLog,
        setSelectedLog,
        fetchAging,
        fetchRules,
        fetchLogs,
        handleRunAudit,
        handleDeleteRule,
        filtered,
        totalOutstanding,
        totalOverdue,
        holdCount,
    };
}
