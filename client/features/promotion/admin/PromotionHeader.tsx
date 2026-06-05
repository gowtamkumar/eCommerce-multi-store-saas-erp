'use client';

import { Megaphone, Plus } from 'lucide-react';
import React from 'react';
import type { PromotionHeaderProps } from '../types';

const PromotionHeader: React.FC<PromotionHeaderProps> = ({ onAddClick }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-brand-600" />
                Promotional Offers
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage automatic discounts, flash sales, and targeted brand offers
            </p>
        </div>
        <button
            onClick={onAddClick}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium shadow-sm shadow-brand-500/20"
        >
            <Plus className="w-4 h-4" />
            Create Promotion
        </button>
    </div>
);

export default PromotionHeader;
