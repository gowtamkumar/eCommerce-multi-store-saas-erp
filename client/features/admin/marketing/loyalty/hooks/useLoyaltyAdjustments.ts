'use client';

import {
    getCustomerLoyaltyHistory,
    manualCreditPoints,
    manualDebitPoints,
    type LoyaltyLedgerEntry,
} from '@/services/loyalty';
import { useCallback, useState } from 'react';
import { getErrorMessage } from '../lib/loyalty';
import type { LoyaltyAdjustmentAction, LoyaltyAlert } from '../types';

const EMPTY_MESSAGE: LoyaltyAlert = { text: '', type: '' };

export function useLoyaltyAdjustments() {
    const [customerId, setCustomerId] = useState('');
    const [adjustPoints, setAdjustPoints] = useState(100);
    const [adjustNote, setAdjustNote] = useState('');
    const [customerHistory, setCustomerHistory] = useState<LoyaltyLedgerEntry[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [message, setMessage] = useState<LoyaltyAlert>(EMPTY_MESSAGE);

    const fetchCustomerHistory = useCallback(async () => {
        if (!customerId.trim()) return;

        setLoadingHistory(true);
        setMessage(EMPTY_MESSAGE);
        try {
            const history = await getCustomerLoyaltyHistory(customerId.trim());
            setCustomerHistory(history);
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Failed to fetch ledger for this customer ID. Verify it is correct.', type: 'error' });
            setCustomerHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    }, [customerId]);

    const adjustPointsBalance = useCallback(async (action: LoyaltyAdjustmentAction) => {
        if (!customerId.trim()) {
            setMessage({ text: 'Customer ID is required', type: 'error' });
            return;
        }
        if (adjustPoints <= 0) {
            setMessage({ text: 'Points value must be greater than 0', type: 'error' });
            return;
        }
        if (!adjustNote.trim()) {
            setMessage({ text: 'A detailed explanation note is required for ledger audits', type: 'error' });
            return;
        }

        setLoadingHistory(true);
        setMessage(EMPTY_MESSAGE);
        try {
            if (action === 'credit') {
                await manualCreditPoints(customerId.trim(), adjustPoints, adjustNote.trim());
                setMessage({ text: `Successfully credited ${adjustPoints} points!`, type: 'success' });
            } else {
                await manualDebitPoints(customerId.trim(), adjustPoints, adjustNote.trim());
                setMessage({ text: `Successfully debited ${adjustPoints} points!`, type: 'success' });
            }

            setAdjustNote('');
            const history = await getCustomerLoyaltyHistory(customerId.trim());
            setCustomerHistory(history);
        } catch (error) {
            console.error(error);
            setMessage({ text: getErrorMessage(error, 'Adjustment failed'), type: 'error' });
        } finally {
            setLoadingHistory(false);
        }
    }, [customerId, adjustPoints, adjustNote]);

    const setRoundedAdjustPoints = useCallback((value: number) => {
        setAdjustPoints(Math.max(1, Math.round(value)));
    }, []);

    return {
        customerId,
        adjustPoints,
        adjustNote,
        customerHistory,
        loadingHistory,
        message,
        setCustomerId,
        setAdjustPoints: setRoundedAdjustPoints,
        setAdjustNote,
        fetchCustomerHistory,
        adjustPointsBalance,
    };
}
