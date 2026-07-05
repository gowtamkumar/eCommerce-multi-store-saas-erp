import type { LoyaltyConfig, LoyaltyLedgerEntry, LoyaltyLiability, LoyaltyRule } from '@/services/loyalty';
import type { FormEvent } from 'react';

export type LoyaltySubTab = 'rules' | 'adjust' | 'dynamic';
export type LoyaltyAlertType = '' | 'success' | 'error';
export type LoyaltyAdjustmentAction = 'credit' | 'debit';
export type LoyaltyRuleType = LoyaltyRule['type'];

export interface LoyaltyAlert {
    text: string;
    type: LoyaltyAlertType;
}

export interface LoyaltyRuleFormData {
    name: string;
    type: LoyaltyRuleType;
    value: number;
    categoryId: string;
    minSpend: number;
    isActive: boolean;
    startDate: string;
    endDate: string;
}

export interface LoyaltyHeaderProps {
    activeTab: LoyaltySubTab;
    onTabChange: (tab: LoyaltySubTab) => void;
    currencyCode?: string;
    currencySymbol?: string;
}

export interface ProgramRulesTabProps {
    config: LoyaltyConfig;
    liability: LoyaltyLiability | null;
    saving: boolean;
    message: LoyaltyAlert;
    formatPrice: (amount: number) => string;
    currencyCode: string;
    currencySymbol: string;
    onConfigChange: (patch: Partial<LoyaltyConfig>) => void;
    onSubmit: (event: FormEvent) => void;
}

export interface PointsAdjustmentTabProps {
    customerId: string;
    adjustPoints: number;
    adjustNote: string;
    customerHistory: LoyaltyLedgerEntry[];
    loadingHistory: boolean;
    message: LoyaltyAlert;
    onCustomerIdChange: (value: string) => void;
    onAdjustPointsChange: (value: number) => void;
    onAdjustNoteChange: (value: string) => void;
    onFetchHistory: () => void;
    onAdjustment: (action: LoyaltyAdjustmentAction) => void;
}

export interface DynamicRulesTabProps {
    rules: LoyaltyRule[];
    loadingRules: boolean;
    formatPrice: (amount: number) => string;
    onAddRule: () => void;
    onEditRule: (rule: LoyaltyRule) => void;
    onDeleteRule: (id: string) => void;
}

export interface LoyaltyRuleCardProps {
    rule: LoyaltyRule;
    formatPrice: (amount: number) => string;
    onEdit: (rule: LoyaltyRule) => void;
    onDelete: (id: string) => void;
}

export interface LoyaltyRuleModalProps {
    editingRule: Partial<LoyaltyRule> | null;
    formData: LoyaltyRuleFormData;
    submitting: boolean;
    currencyCode: string;
    currencySymbol: string;
    formatPrice: (amount: number) => string;
    onFieldChange: <K extends keyof LoyaltyRuleFormData>(field: K, value: LoyaltyRuleFormData[K]) => void;
    onClose: () => void;
    onSubmit: (event: FormEvent) => void;
}
