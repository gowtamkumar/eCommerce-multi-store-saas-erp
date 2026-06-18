'use client';

import { RefreshCw, Save } from 'lucide-react';
import type { LoyaltyConfig } from '@/services/loyalty';
import type { ProgramRulesTabProps } from '../types';
import { LoyaltyProgramAiAssist } from './LoyaltyProgramAiAssist';

interface NumberFieldProps {
    label: string;
    value: number | '';
    min?: number;
    step?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

function NumberField({ label, value, min = 0, step, placeholder, onChange }: NumberFieldProps) {
    return (
        <div>
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</label>
            <input
                type="number"
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                min={min}
                step={step}
            />
        </div>
    );
}

function TierField({
    label,
    threshold,
    multiplier,
    onThresholdChange,
    onMultiplierChange,
}: {
    label: string;
    threshold: number;
    multiplier: number;
    onThresholdChange: (value: number) => void;
    onMultiplierChange: (value: number) => void;
}) {
    return (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-black text-slate-700 dark:text-slate-300">{label}</h4>
            <NumberField
                label="Min 12m Spending"
                value={threshold}
                onChange={(value) => onThresholdChange(Number(value))}
            />
            <NumberField
                label="Multiplier Boost"
                value={multiplier}
                min={1}
                step="0.05"
                onChange={(value) => onMultiplierChange(Number(value))}
            />
        </div>
    );
}

export default function ProgramRulesTab({
    config,
    liability,
    saving,
    message,
    onConfigChange,
    onSubmit,
}: ProgramRulesTabProps) {
    const patch = (patchValue: Partial<LoyaltyConfig>) => onConfigChange(patchValue);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {message.text && (
                <div className={`p-4 rounded-2xl text-xs font-bold border ${message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400'
                    : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400'
                    }`}
                >
                    {message.text}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Active Status</h3>
                    <p className="text-xs text-slate-400">Toggle the entire points & rewards program on or off globally.</p>
                </div>
                <button
                    type="button"
                    onClick={() => patch({ isEnabled: !config.isEnabled })}
                    className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${config.isEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                    <span className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${config.isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${!config.isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-800 space-y-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                        Conversion Settings
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <NumberField
                            label="Points Earned per $1 Spent"
                            value={config.pointsPerCurrencySpent}
                            onChange={(value) => patch({ pointsPerCurrencySpent: Number(value) })}
                        />
                        <NumberField
                            label="Points Required per $1 Discount"
                            value={config.pointsRequiredPerCurrencyDiscount}
                            min={1}
                            onChange={(value) => patch({ pointsRequiredPerCurrencyDiscount: Number(value) })}
                        />
                        <div>
                            <NumberField
                                label="Points Expire After Days"
                                value={config.pointsExpireAfterDays ?? ''}
                                min={1}
                                placeholder="Never"
                                onChange={(value) => patch({ pointsExpireAfterDays: value ? Number(value) : null })}
                            />
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Blank means points never expire.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="rounded-2xl bg-brand-50 dark:bg-brand-950/20 p-4 border border-brand-100 dark:border-brand-900/50">
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest">Outstanding Liability</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{(liability?.outstandingPoints ?? 0).toLocaleString()}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customers Holding Points</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{(liability?.customers ?? 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-800 space-y-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                        Referral Rewards
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Reward Channel</label>
                            <select
                                value={config.referralRewardType}
                                onChange={(event) => patch({ referralRewardType: event.target.value as LoyaltyConfig['referralRewardType'] })}
                                className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                            >
                                <option value="POINTS">Loyalty Points</option>
                                <option value="WALLET">Wallet Credit</option>
                            </select>
                        </div>
                        <NumberField
                            label="Reward Value"
                            value={config.referralRewardAmount}
                            onChange={(value) => patch({ referralRewardAmount: Number(value) })}
                        />
                        <NumberField
                            label="Referee Min Order"
                            value={config.refereeMinPurchase}
                            onChange={(value) => patch({ refereeMinPurchase: Number(value) })}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-800 space-y-6 lg:col-span-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                        Customer-Facing Copy
                    </h3>
                    <LoyaltyProgramAiAssist
                        config={config}
                        onApply={(result) =>
                            patch({
                                programDescription: result.programDescription,
                                referralMessage: result.referralMessage,
                            })
                        }
                    />
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                Program Description
                            </label>
                            <textarea
                                value={config.programDescription ?? ''}
                                onChange={(event) => patch({ programDescription: event.target.value })}
                                rows={4}
                                placeholder="Explain how customers earn, redeem, and level up through tiers..."
                                className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white resize-y"
                            />
                            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Shown on the customer loyalty profile when set.
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                Referral Invite Message
                            </label>
                            <input
                                type="text"
                                value={config.referralMessage ?? ''}
                                onChange={(event) => patch({ referralMessage: event.target.value })}
                                maxLength={500}
                                placeholder="Invite friends and earn rewards when they join..."
                                className="w-full mt-2 px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-950 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-200/50 dark:border-slate-800 space-y-6 lg:col-span-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                        Membership Tier Spending Levels & Multipliers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TierField
                            label="SILVER TIER"
                            threshold={config.silverTierThreshold}
                            multiplier={config.silverMultiplier}
                            onThresholdChange={(value) => patch({ silverTierThreshold: value })}
                            onMultiplierChange={(value) => patch({ silverMultiplier: value })}
                        />
                        <TierField
                            label="GOLD TIER"
                            threshold={config.goldTierThreshold}
                            multiplier={config.goldMultiplier}
                            onThresholdChange={(value) => patch({ goldTierThreshold: value })}
                            onMultiplierChange={(value) => patch({ goldMultiplier: value })}
                        />
                        <TierField
                            label="PLATINUM TIER"
                            threshold={config.platinumTierThreshold}
                            multiplier={config.platinumMultiplier}
                            onThresholdChange={(value) => patch({ platinumTierThreshold: value })}
                            onMultiplierChange={(value) => patch({ platinumMultiplier: value })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs flex items-center gap-2 shadow-xl shadow-brand-500/10 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Rules Config
                </button>
            </div>
        </form>
    );
}
