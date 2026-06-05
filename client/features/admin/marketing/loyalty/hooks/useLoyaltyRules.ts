'use client';

import {
    createLoyaltyRule,
    deleteLoyaltyRule,
    getLoyaltyRules,
    updateLoyaltyRule,
    type LoyaltyRule,
} from '@/services/loyalty';
import { useCallback, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { buildRulePayload, getErrorMessage, getInitialRuleFormData } from '../lib/loyalty';
import type { LoyaltyRuleFormData } from '../types';

export function useLoyaltyRules() {
    const [rules, setRules] = useState<LoyaltyRule[]>([]);
    const [loadingRules, setLoadingRules] = useState(false);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState<Partial<LoyaltyRule> | null>(null);
    const [formData, setFormData] = useState<LoyaltyRuleFormData>(getInitialRuleFormData());
    const [submittingRule, setSubmittingRule] = useState(false);

    const loadRules = useCallback(async () => {
        setLoadingRules(true);
        try {
            const data = await getLoyaltyRules();
            setRules(data);
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to load dynamic rules'));
        } finally {
            setLoadingRules(false);
        }
    }, []);

    const openRuleModal = useCallback((rule: Partial<LoyaltyRule> | null = null) => {
        setEditingRule(rule);
        setFormData(getInitialRuleFormData(rule));
        setShowRuleModal(true);
    }, []);

    const closeRuleModal = useCallback(() => setShowRuleModal(false), []);

    const setField = useCallback(<K extends keyof LoyaltyRuleFormData>(
        field: K,
        value: LoyaltyRuleFormData[K],
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const saveRule = useCallback(async (event: FormEvent) => {
        event.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Rule name is required');
            return;
        }

        setSubmittingRule(true);
        try {
            const payload = buildRulePayload(formData);
            if (editingRule?.id) {
                await updateLoyaltyRule(editingRule.id, payload);
                toast.success('Loyalty rule updated successfully');
            } else {
                await createLoyaltyRule(payload);
                toast.success('Loyalty rule created successfully');
            }

            setShowRuleModal(false);
            void loadRules();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to save loyalty rule'));
        } finally {
            setSubmittingRule(false);
        }
    }, [editingRule, formData, loadRules]);

    const deleteRule = useCallback(async (id: string) => {
        if (!confirm('Are you sure you want to delete this rule?')) return;
        try {
            await deleteLoyaltyRule(id);
            toast.success('Loyalty rule deleted successfully');
            void loadRules();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to delete rule'));
        }
    }, [loadRules]);

    return {
        rules,
        loadingRules,
        showRuleModal,
        editingRule,
        formData,
        submittingRule,
        loadRules,
        openRuleModal,
        closeRuleModal,
        setField,
        saveRule,
        deleteRule,
    };
}
