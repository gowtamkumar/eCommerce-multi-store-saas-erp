'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createJournalEntry, getAccounts, getJournalEntries, reverseJournalEntry } from '@/services/accounting';
import { fetchAPI } from '@/services/api';
import toast from 'react-hot-toast';
import type { LedgerEntry, GLJournalEntry, FormLine } from '../types';

export function useGeneralLedger() {
    const [activeTab, setActiveTab] = useState<'double-entry' | 'inventory'>('double-entry');

    // Chart of Accounts for combo box
    const [coa, setCoa] = useState<any[]>([]);

    // Financial GL Entries state
    const [glEntries, setGlEntries] = useState<GLJournalEntry[]>([]);
    const [glLoading, setGlLoading] = useState(true);
    const [glSearch, setGlSearch] = useState('');
    const [expandedJournals, setExpandedJournals] = useState<string[]>([]);

    // Inventory Ledger state
    const [invEntries, setInvEntries] = useState<LedgerEntry[]>([]);
    const [invTotal, setInvTotal] = useState(0);
    const [invPage, setInvPage] = useState(1);
    const [invSearch, setInvSearch] = useState("");
    const [invTypeFilter, setInvTypeFilter] = useState("");
    const [invLoading, setInvLoading] = useState(true);
    const INV_LIMIT = 20;

    // Post modal states
    const [postOpen, setPostOpen] = useState(false);
    const [journalType, setJournalType] = useState('GENERAL');
    const [description, setDescription] = useState('');
    const [journalDate, setJournalDate] = useState('');
    const [refType, setRefType] = useState('');
    const [refId, setRefId] = useState('');
    const [lines, setLines] = useState<FormLine[]>([
        { accountCode: '', side: 'DEBIT', amount: '' },
        { accountCode: '', side: 'CREDIT', amount: '' }
    ]);
    const [posting, setPosting] = useState(false);

    const fetchCoa = useCallback(async () => {
        try {
            const res = await getAccounts();
            if (res.success) setCoa(res.data || []);
        } catch { }
    }, []);

    const loadGLEntries = useCallback(async () => {
        setGlLoading(true);
        try {
            const res = await getJournalEntries();
            if (res.success) setGlEntries(res.data || []);
        } catch {
            toast.error('Failed to load journal entries');
        } finally {
            setGlLoading(false);
        }
    }, []);

    const loadInvEntries = useCallback(async () => {
        setInvLoading(true);
        try {
            const params = new URLSearchParams({ page: String(invPage), limit: String(INV_LIMIT) });
            if (invSearch) params.set("q", invSearch);
            if (invTypeFilter) params.set("type", invTypeFilter);
            const res = await fetchAPI(`/inventory-ledger?${params.toString()}`);
            setInvEntries(res?.data?.items || []);
            setInvTotal(res?.data?.total || 0);
        } catch {
            toast.error("Failed to load inventory movements");
        } finally {
            setInvLoading(false);
        }
    }, [invPage, invSearch, invTypeFilter]);

    useEffect(() => {
        void fetchCoa();
    }, [fetchCoa]);

    useEffect(() => {
        if (activeTab === 'double-entry') {
            void loadGLEntries();
        } else {
            void loadInvEntries();
        }
    }, [activeTab, loadGLEntries, loadInvEntries]);

    // Expand/Collapse Journal detail rows
    const toggleExpand = useCallback((id: string) => {
        setExpandedJournals(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    // Calculate Balanced Double-Entry totals
    const formTotals = useMemo(() => {
        let debits = 0;
        let credits = 0;
        lines.forEach(l => {
            const val = parseFloat(l.amount) || 0;
            if (l.side === 'DEBIT') debits += val;
            else credits += val;
        });
        return {
            debits,
            credits,
            difference: Math.abs(debits - credits),
            isBalanced: Math.abs(debits - credits) < 0.01
        };
    }, [lines]);

    const handleAddLine = useCallback(() => {
        setLines(prev => [...prev, { accountCode: '', side: 'DEBIT' as const, amount: '' }]);
    }, []);

    const handleRemoveLine = useCallback((idx: number) => {
        if (lines.length <= 2) {
            toast.error('A journal entry must contain at least 2 lines');
            return;
        }
        setLines(prev => prev.filter((_, i) => i !== idx));
    }, [lines.length]);

    const handleLineChange = useCallback((idx: number, field: keyof FormLine, value: string) => {
        setLines(prev => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    }, []);

    const handlePostJournal = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTotals.isBalanced || formTotals.debits === 0) {
            toast.error('Journal entry is unbalanced or empty');
            return;
        }

        // Ensure all lines have account selection
        if (lines.some(l => !l.accountCode)) {
            toast.error('Please select an account for all entry lines');
            return;
        }

        setPosting(true);
        const toastId = toast.loading('Posting journal voucher to General Ledger...');
        try {
            const payload = {
                date: journalDate || undefined,
                type: journalType,
                description,
                referenceType: refType || undefined,
                referenceId: refId || undefined,
                lines: lines.map(l => ({
                    accountCode: l.accountCode,
                    side: l.side,
                    amount: parseFloat(l.amount)
                }))
            };

            const res = await createJournalEntry(payload);
            if (res.success) {
                toast.success('Journal entry posted successfully!', { id: toastId });
                setPostOpen(false);
                setDescription('');
                setJournalDate('');
                setRefType('');
                setRefId('');
                setLines([
                    { accountCode: '', side: 'DEBIT', amount: '' },
                    { accountCode: '', side: 'CREDIT', amount: '' }
                ]);
                void loadGLEntries();
            } else {
                toast.error(res.message || 'Post execution failed', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error posting journal entry', { id: toastId });
        } finally {
            setPosting(false);
        }
    }, [formTotals, lines, journalDate, journalType, description, refType, refId, loadGLEntries]);

    const handleReverseJournal = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to reverse this journal entry? This will generate a correcting counter-journal.')) return;
        const toastId = toast.loading('Reversing journal...');
        try {
            const res = await reverseJournalEntry(id);
            if (res.success) {
                toast.success('Journal entry reversed successfully!', { id: toastId });
                void loadGLEntries();
            } else {
                toast.error(res.message || 'Reversal failed', { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || 'Error reversing journal entry', { id: toastId });
        }
    }, [loadGLEntries]);

    // Filtered Financial entries
    const filteredGlEntries = useMemo(() => {
        return glEntries.filter(e =>
            e.description.toLowerCase().includes(glSearch.toLowerCase()) ||
            e.type.toLowerCase().includes(glSearch.toLowerCase()) ||
            e.referenceId?.toLowerCase().includes(glSearch.toLowerCase()) ||
            e.lines.some(l => l.account.name.toLowerCase().includes(glSearch.toLowerCase()) || l.account.code.includes(glSearch))
        );
    }, [glEntries, glSearch]);

    const totalInvPages = useMemo(() => Math.ceil(invTotal / INV_LIMIT), [invTotal]);

    return {
        activeTab,
        setActiveTab,
        coa,
        glEntries,
        glLoading,
        glSearch,
        setGlSearch,
        expandedJournals,
        invEntries,
        invTotal,
        invPage,
        setInvPage,
        invSearch,
        setInvSearch,
        invTypeFilter,
        setInvTypeFilter,
        invLoading,
        postOpen,
        setPostOpen,
        journalType,
        setJournalType,
        description,
        setDescription,
        journalDate,
        setJournalDate,
        refType,
        setRefType,
        refId,
        setRefId,
        lines,
        posting,
        loadGLEntries,
        loadInvEntries,
        toggleExpand,
        formTotals,
        handleAddLine,
        handleRemoveLine,
        handleLineChange,
        handlePostJournal,
        handleReverseJournal,
        filteredGlEntries,
        totalInvPages,
    };
}
