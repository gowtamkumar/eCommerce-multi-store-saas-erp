'use client';

import { useCallback } from 'react';
import { useArDashboard } from '../hooks/useArDashboard';
import ArAgingDashboard from './ar/ArAgingDashboard';
import ArCollectionDraftModal from './ar/ArCollectionDraftModal';
import ArHeader from './ar/ArHeader';
import ArTabs from './ar/ArTabs';
import DunningLogDetailsModal from './ar/DunningLogDetailsModal';
import DunningLogsView from './ar/DunningLogsView';
import DunningRuleModal from './ar/DunningRuleModal';
import DunningRulesView from './ar/DunningRulesView';
import PaymentModal from './ar/PaymentModal';

export default function ArAgingReport() {
    const ar = useArDashboard();

    const handleRefresh = useCallback(() => {
        if (ar.activeTab === 'dashboard') void ar.fetchAging();
        else if (ar.activeTab === 'rules') void ar.fetchRules();
        else if (ar.activeTab === 'logs') void ar.fetchLogs();
    }, [ar.activeTab, ar.fetchAging, ar.fetchRules, ar.fetchLogs]);

    return (
        <div className="space-y-6 pb-10">
            <ArHeader
                runningAudit={ar.runningAudit}
                loading={ar.loading}
                onRunAudit={ar.handleRunAudit}
                onRefresh={handleRefresh}
            />

            <ArTabs activeTab={ar.activeTab} onTabChange={ar.setActiveTab} />

            {ar.activeTab === 'dashboard' && (
                <ArAgingDashboard
                    rows={ar.rows}
                    filtered={ar.filtered}
                    loading={ar.loading}
                    search={ar.search}
                    onSearchChange={ar.setSearch}
                    totalOutstanding={ar.totalOutstanding}
                    totalOverdue={ar.totalOverdue}
                    holdCount={ar.holdCount}
                    onPay={ar.setPayingCustomer}
                    onCollect={ar.setCollectingCustomer}
                />
            )}

            {ar.activeTab === 'rules' && (
                <DunningRulesView
                    rules={ar.rules}
                    loading={ar.loading}
                    onCreate={() => {
                        ar.setEditingRule(null);
                        ar.setShowRuleModal(true);
                    }}
                    onEdit={(rule) => {
                        ar.setEditingRule(rule);
                        ar.setShowRuleModal(true);
                    }}
                    onDelete={ar.handleDeleteRule}
                />
            )}

            {ar.activeTab === 'logs' && (
                <DunningLogsView logs={ar.logs} loading={ar.loading} onViewDetails={ar.setSelectedLog} />
            )}

            {ar.showRuleModal && (
                <DunningRuleModal
                    rule={ar.editingRule}
                    onClose={() => {
                        ar.setShowRuleModal(false);
                        ar.setEditingRule(null);
                    }}
                    onSuccess={ar.fetchRules}
                />
            )}

            {ar.payingCustomer && (
                <PaymentModal
                    customer={ar.payingCustomer}
                    onClose={() => ar.setPayingCustomer(null)}
                    onSuccess={ar.fetchAging}
                />
            )}

            {ar.collectingCustomer && (
                <ArCollectionDraftModal
                    customer={ar.collectingCustomer}
                    onClose={() => ar.setCollectingCustomer(null)}
                />
            )}

            {ar.selectedLog && (
                <DunningLogDetailsModal log={ar.selectedLog} onClose={() => ar.setSelectedLog(null)} />
            )}
        </div>
    );
}
