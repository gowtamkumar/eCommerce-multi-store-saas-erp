'use client';

import { useSettings } from '@/hooks/SettingsContext';
import { fetchAPI } from '@/services/api';
import dayjs from 'dayjs';
import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ProfitLossData } from '../types';
import ProfitLossHeader from './ProfitLossHeader';
import ProfitLossKpiGrid from './ProfitLossKpiGrid';
import FinancialStatement from './FinancialStatement';
import ExpenseDistribution from './ExpenseDistribution';

export default function ProfitLossDashboard() {
    const { formatPrice } = useSettings();
    const [data, setData] = useState<ProfitLossData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });

    const fetchReport = useCallback(async () => {
        try {
            setIsLoading(true);
            const query = `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
            const res = await fetchAPI(`/report/profit-loss${query}`);
            if (res && res.data) {
                setData(res.data);
            }
        } catch (error) {
            console.error('Error loading P&L report:', error);
            toast.error('Failed to load P&L report');
        } finally {
            setIsLoading(false);
        }
    }, [dateRange.startDate, dateRange.endDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
        setDateRange(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <ProfitLossHeader 
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateChange={handleDateChange}
                onFilter={fetchReport}
            />

            <ProfitLossKpiGrid 
                data={data}
                isLoading={isLoading}
                formatPrice={formatPrice}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <FinancialStatement 
                        data={data}
                        isLoading={isLoading}
                        formatPrice={formatPrice}
                    />
                </div>
                <div className="lg:col-span-1">
                    <ExpenseDistribution 
                        data={data?.operatingExpenses}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
}
