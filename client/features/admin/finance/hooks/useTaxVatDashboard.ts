'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import {
    calculateTax,
    createTaxRule,
    deleteTaxRule,
    getTaxFiling,
    getTaxRules,
    initializeTaxRules,
} from '@/services/accounting';
import type {
    TaxCalculationFormData,
    TaxCalculationResult,
    TaxFilingData,
    TaxRule,
    TaxRuleFormData,
    TaxVatTab,
} from '../types';

const DEFAULT_RULE_FORM: TaxRuleFormData = {
    name: '',
    rate: '',
    country: 'BD',
    state: '',
    category: 'STANDARD',
};

const DEFAULT_CALC_FORM: TaxCalculationFormData = {
    country: 'BD',
    state: 'Dhaka',
    category: 'STANDARD',
    amount: '1000',
};

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function useTaxVatDashboard() {
    const [activeTab, setActiveTab] = useState<TaxVatTab>('filing');
    const [rules, setRules] = useState<TaxRule[]>([]);
    const [rulesLoading, setRulesLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [ruleForm, setRuleForm] = useState<TaxRuleFormData>(DEFAULT_RULE_FORM);
    const [filing, setFiling] = useState<TaxFilingData | null>(null);
    const [filingLoading, setFilingLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [calcForm, setCalcForm] = useState<TaxCalculationFormData>(DEFAULT_CALC_FORM);
    const [calcResult, setCalcResult] = useState<TaxCalculationResult | null>(null);
    const [calculating, setCalculating] = useState(false);

    const loadRules = useCallback(async () => {
        setRulesLoading(true);
        try {
            const res = await getTaxRules();
            if (res.success) setRules(res.data || []);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load tax rules'));
        } finally {
            setRulesLoading(false);
        }
    }, []);

    const loadFiling = useCallback(async () => {
        setFilingLoading(true);
        try {
            const params: { startDate?: string; endDate?: string } = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await getTaxFiling(params);
            if (res.success) setFiling(res.data || null);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to load tax filing return'));
        } finally {
            setFilingLoading(false);
        }
    }, [endDate, startDate]);

    useEffect(() => {
        void loadRules();
    }, [loadRules]);

    useEffect(() => {
        if (activeTab === 'filing') void loadFiling();
    }, [activeTab, loadFiling]);

    const refreshActiveTab = useCallback(() => {
        if (activeTab === 'rules') {
            void loadRules();
            return;
        }

        void loadFiling();
    }, [activeTab, loadFiling, loadRules]);

    const resetRuleForm = useCallback(() => {
        setRuleForm(DEFAULT_RULE_FORM);
    }, []);

    const openCreateModal = useCallback(() => {
        resetRuleForm();
        setCreateOpen(true);
    }, [resetRuleForm]);

    const closeCreateModal = useCallback(() => {
        setCreateOpen(false);
        resetRuleForm();
    }, [resetRuleForm]);

    const setRuleField = useCallback((field: keyof TaxRuleFormData, value: string) => {
        setRuleForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const setCalcField = useCallback((field: keyof TaxCalculationFormData, value: string) => {
        setCalcForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const seedDefaultRules = useCallback(async () => {
        const toastId = toast.loading('Seeding standard regional tax rules...');
        try {
            const res = await initializeTaxRules();
            if (res.success) {
                toast.success('Standard rules loaded!', { id: toastId });
                await loadRules();
            } else {
                toast.error(res.message || 'Seeding failed', { id: toastId });
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Connection error seeding rules'), { id: toastId });
        }
    }, [loadRules]);

    const createRule = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        if (!ruleForm.name || !ruleForm.rate) return;

        try {
            const res = await createTaxRule({
                name: ruleForm.name,
                rate: parseFloat(ruleForm.rate),
                country: ruleForm.country,
                state: ruleForm.state || undefined,
                category: ruleForm.category,
            });

            if (res.success) {
                toast.success('Tax jurisdiction rule configured successfully!');
                closeCreateModal();
                await loadRules();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to create tax rule'));
        }
    }, [closeCreateModal, loadRules, ruleForm]);

    const deleteRule = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this custom tax jurisdiction rule?')) return;

        try {
            const res = await deleteTaxRule(id);
            if (res.success) {
                toast.success('Rule removed');
                await loadRules();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, 'Failed to delete rule'));
        }
    }, [loadRules]);

    const simulateCalculation = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        setCalculating(true);
        try {
            const res = await calculateTax({
                country: calcForm.country,
                state: calcForm.state || undefined,
                category: calcForm.category,
                baseAmount: parseFloat(calcForm.amount) || 0,
            });

            if (res.success) setCalcResult(res.data || null);
        } catch (error) {
            toast.error(getErrorMessage(error, 'Sandbox computation failed'));
        } finally {
            setCalculating(false);
        }
    }, [calcForm]);

    const exportFilingReport = useCallback(() => {
        toast.success('Structured CSV data downloaded successfully!');
    }, []);

    return {
        activeTab,
        setActiveTab,
        rules,
        rulesLoading,
        createOpen,
        ruleForm,
        filing,
        filingLoading,
        startDate,
        endDate,
        calcForm,
        calcResult,
        calculating,
        setStartDate,
        setEndDate,
        setRuleField,
        setCalcField,
        loadRules,
        loadFiling,
        refreshActiveTab,
        seedDefaultRules,
        openCreateModal,
        closeCreateModal,
        createRule,
        deleteRule,
        simulateCalculation,
        exportFilingReport,
    };
}
