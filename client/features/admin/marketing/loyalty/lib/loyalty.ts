import type { LoyaltyRule } from '@/services/loyalty';
import type { LoyaltyRuleFormData } from '../types';

export function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export function toDateTimeLocal(value?: string) {
    return value ? new Date(value).toISOString().slice(0, 16) : '';
}

export function getInitialRuleFormData(rule?: Partial<LoyaltyRule> | null): LoyaltyRuleFormData {
    return {
        name: rule?.name || '',
        type: rule?.type || 'CATEGORY_MULTIPLIER',
        value: rule?.value || 2,
        categoryId: String(rule?.conditions?.categoryId || ''),
        minSpend: Number(rule?.conditions?.minSpend || rule?.conditions?.threshold || 100),
        isActive: rule?.isActive !== false,
        startDate: toDateTimeLocal(rule?.startDate),
        endDate: toDateTimeLocal(rule?.endDate),
    };
}

export function buildRulePayload(formData: LoyaltyRuleFormData): Partial<LoyaltyRule> {
    const conditions: Record<string, unknown> = {};
    if (formData.type === 'CATEGORY_MULTIPLIER') {
        conditions.categoryId = formData.categoryId.trim();
    } else if (formData.type === 'MIN_SPEND_BONUS') {
        conditions.minSpend = Number(formData.minSpend);
    }

    return {
        name: formData.name.trim(),
        type: formData.type,
        value: Number(formData.value),
        conditions,
        isActive: formData.isActive,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    };
}

export function getRulePresentation(rule: LoyaltyRule) {
    if (rule.type === 'CATEGORY_MULTIPLIER') {
        return {
            badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
            typeLabel: 'Category Multiplier',
            valueDisplay: `${Number(rule.value)}x Points`,
        };
    }

    if (rule.type === 'MIN_SPEND_BONUS') {
        return {
            badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
            typeLabel: 'Min Spend Bonus',
            valueDisplay: `+${Number(rule.value).toLocaleString()} Points`,
        };
    }

    return {
        badgeColor: 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400',
        typeLabel: 'Weekend Multiplier',
        valueDisplay: `${Number(rule.value)}x Points`,
    };
}
