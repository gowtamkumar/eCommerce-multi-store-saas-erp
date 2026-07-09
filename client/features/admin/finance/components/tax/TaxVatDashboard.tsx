'use client';

import { useMemo } from 'react';
import { useSettings } from '@/hooks/SettingsContext';
import {
    buildRelatedTaxRulesSummary,
    buildTaxRuleFormSummary,
    buildTaxRuleSummary,
} from '../../lib/buildTaxRuleExplanationContext';
import { useTaxVatDashboard } from '../../hooks/useTaxVatDashboard';
import TaxFilingView from './TaxFilingView';
import TaxRuleExplanationModal from './TaxRuleExplanationModal';
import TaxRuleFormModal from './TaxRuleFormModal';
import TaxRulesView from './TaxRulesView';
import TaxSandboxView from './TaxSandboxView';
import TaxVatHeader from './TaxVatHeader';
import TaxVatTabs from './TaxVatTabs';
import { buildTaxFilingColumns, buildTaxRuleColumns } from './taxColumns';

export function TaxVatDashboard() {
    const { formatPrice, selectedCurrency } = useSettings();
    const tax = useTaxVatDashboard();

    const filingColumns = useMemo(
        () => buildTaxFilingColumns(formatPrice),
        [formatPrice],
    );

    const ruleColumns = useMemo(
        () => buildTaxRuleColumns(tax.deleteRule, tax.openExplainRule),
        [tax.deleteRule, tax.openExplainRule],
    );

    const explanationModalProps = useMemo(() => {
        if (tax.explainingRule) {
            return {
                title: 'Tax rule explanation',
                subtitle: `${tax.explainingRule.name} · ${tax.explainingRule.country}${tax.explainingRule.state ? ` / ${tax.explainingRule.state}` : ''} · ${tax.explainingRule.rate}%`,
                ruleSummary: buildTaxRuleSummary(tax.explainingRule),
                relatedRulesSummary: buildRelatedTaxRulesSummary(tax.rules, tax.explainingRule.id),
            };
        }

        if (tax.explainingDraft) {
            return {
                title: 'Draft rule explanation',
                subtitle: `${tax.ruleForm.name || 'New rule'} · ${tax.ruleForm.country}${tax.ruleForm.state ? ` / ${tax.ruleForm.state}` : ''}`,
                ruleSummary: buildTaxRuleFormSummary(tax.ruleForm),
                relatedRulesSummary: buildRelatedTaxRulesSummary(tax.rules),
            };
        }

        return null;
    }, [tax.explainingRule, tax.explainingDraft, tax.ruleForm, tax.rules]);

    return (
        <div className="space-y-6 pb-12">
            <TaxVatHeader
                activeTab={tax.activeTab}
                hasRules={tax.rules.length > 0}
                onSeedDefaults={tax.seedDefaultRules}
                onCreateRule={tax.openCreateModal}
                onRefresh={tax.refreshActiveTab}
                currencyCode={selectedCurrency.code}
                currencySymbol={selectedCurrency.symbol}
            />

            <TaxVatTabs activeTab={tax.activeTab} onTabChange={tax.setActiveTab} />

            {tax.activeTab === 'filing' && (
                <TaxFilingView
                    filing={tax.filing}
                    loading={tax.filingLoading}
                    startDate={tax.startDate}
                    endDate={tax.endDate}
                    columns={filingColumns}
                    formatPrice={formatPrice}
                    onStartDateChange={tax.setStartDate}
                    onEndDateChange={tax.setEndDate}
                    onExport={tax.exportFilingReport}
                />
            )}

            {tax.activeTab === 'rules' && (
                <TaxRulesView
                    rules={tax.rules}
                    columns={ruleColumns}
                    loading={tax.rulesLoading}
                />
            )}

            {tax.activeTab === 'sandbox' && (
                <TaxSandboxView
                    formData={tax.calcForm}
                    result={tax.calcResult}
                    calculating={tax.calculating}
                    formatPrice={formatPrice}
                    onFieldChange={tax.setCalcField}
                    onSubmit={tax.simulateCalculation}
                />
            )}

            <TaxRuleFormModal
                open={tax.createOpen}
                formData={tax.ruleForm}
                onFieldChange={tax.setRuleField}
                onClose={tax.closeCreateModal}
                onSubmit={tax.createRule}
                onExplainDraft={tax.openExplainDraft}
            />

            {explanationModalProps && (
                <TaxRuleExplanationModal
                    {...explanationModalProps}
                    onClose={tax.closeExplain}
                />
            )}
        </div>
    );
}
