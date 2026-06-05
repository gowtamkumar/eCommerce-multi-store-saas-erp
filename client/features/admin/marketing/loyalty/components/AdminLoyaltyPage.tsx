'use client';

import { useEffect, useState } from 'react';
import { useLoyaltyAdjustments } from '../hooks/useLoyaltyAdjustments';
import { useLoyaltyConfig } from '../hooks/useLoyaltyConfig';
import { useLoyaltyRules } from '../hooks/useLoyaltyRules';
import type { LoyaltySubTab } from '../types';
import DynamicRulesTab from './DynamicRulesTab';
import LoyaltyHeader from './LoyaltyHeader';
import LoyaltyLoadingState from './LoyaltyLoadingState';
import LoyaltyRuleModal from './LoyaltyRuleModal';
import PointsAdjustmentTab from './PointsAdjustmentTab';
import ProgramRulesTab from './ProgramRulesTab';

export default function AdminLoyaltyPage() {
    const [activeSubTab, setActiveSubTab] = useState<LoyaltySubTab>('rules');
    const configManager = useLoyaltyConfig();
    const adjustmentManager = useLoyaltyAdjustments();
    const rulesManager = useLoyaltyRules();

    useEffect(() => {
        if (activeSubTab === 'dynamic') {
            void rulesManager.loadRules();
        }
    }, [activeSubTab, rulesManager.loadRules]);

    return (
        <div className="space-y-8">
            <LoyaltyHeader activeTab={activeSubTab} onTabChange={setActiveSubTab} />

            {configManager.loading && activeSubTab === 'rules' ? (
                <LoyaltyLoadingState label="Loading engine configurations..." />
            ) : (
                <>
                    {activeSubTab === 'rules' && configManager.config && (
                        <ProgramRulesTab
                            config={configManager.config}
                            liability={configManager.liability}
                            saving={configManager.saving}
                            message={configManager.message}
                            onConfigChange={configManager.updateConfig}
                            onSubmit={configManager.saveConfig}
                        />
                    )}

                    {activeSubTab === 'adjust' && (
                        <PointsAdjustmentTab
                            customerId={adjustmentManager.customerId}
                            adjustPoints={adjustmentManager.adjustPoints}
                            adjustNote={adjustmentManager.adjustNote}
                            customerHistory={adjustmentManager.customerHistory}
                            loadingHistory={adjustmentManager.loadingHistory}
                            message={adjustmentManager.message}
                            onCustomerIdChange={adjustmentManager.setCustomerId}
                            onAdjustPointsChange={adjustmentManager.setAdjustPoints}
                            onAdjustNoteChange={adjustmentManager.setAdjustNote}
                            onFetchHistory={adjustmentManager.fetchCustomerHistory}
                            onAdjustment={adjustmentManager.adjustPointsBalance}
                        />
                    )}

                    {activeSubTab === 'dynamic' && (
                        <DynamicRulesTab
                            rules={rulesManager.rules}
                            loadingRules={rulesManager.loadingRules}
                            onAddRule={() => rulesManager.openRuleModal(null)}
                            onEditRule={rulesManager.openRuleModal}
                            onDeleteRule={rulesManager.deleteRule}
                        />
                    )}
                </>
            )}

            {rulesManager.showRuleModal && (
                <LoyaltyRuleModal
                    editingRule={rulesManager.editingRule}
                    formData={rulesManager.formData}
                    submitting={rulesManager.submittingRule}
                    onFieldChange={rulesManager.setField}
                    onClose={rulesManager.closeRuleModal}
                    onSubmit={rulesManager.saveRule}
                />
            )}
        </div>
    );
}
